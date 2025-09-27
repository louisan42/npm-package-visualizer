const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const semver = require('semver');
const NodeCache = require('node-cache');
const securityService = require('./services/securityService');

const app = express();
const PORT = process.env.PORT || 3001;

// Multi-level caching with different TTLs
const packageCache = new NodeCache({ 
  stdTTL: 3600,        // 1 hour for package data
  checkperiod: 120     // Check for expired keys every 2 minutes
});

const searchCache = new NodeCache({ 
  stdTTL: 1800,        // 30 minutes for search results
  checkperiod: 120 
});

const vulnerabilityCache = new NodeCache({ 
  stdTTL: 7200,        // 2 hours for vulnerability data (changes less frequently)
  checkperiod: 300 
});

const dependencyTreeCache = new NodeCache({ 
  stdTTL: 3600,        // 1 hour for dependency trees
  checkperiod: 120 
});

// Rate limiting configuration
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit search requests to 10 per minute
  message: {
    error: 'Too many search requests, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const treeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit tree requests to 20 per 5 minutes (more expensive)
  message: {
    error: 'Too many dependency tree requests, please try again later.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(generalLimiter); // Apply general rate limiting to all routes

// NPM Registry API base URL
const NPM_REGISTRY = 'https://registry.npmjs.org';

// Utility function to fetch package data from npm registry
async function fetchPackageData(packageName, version = 'latest') {
  const cacheKey = `package-${packageName}-${version}`;
  const cached = packageCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(`${NPM_REGISTRY}/${packageName}`);
    const packageData = response.data;
    
    // Get specific version or latest
    let versionData;
    if (version === 'latest') {
      versionData = packageData.versions[packageData['dist-tags'].latest];
    } else {
      versionData = packageData.versions[version];
    }

    if (!versionData) {
      throw new Error(`Version ${version} not found for package ${packageName}`);
    }

    const result = {
      name: packageData.name,
      version: versionData.version,
      description: versionData.description,
      dependencies: versionData.dependencies || {},
      devDependencies: versionData.devDependencies || {},
      peerDependencies: versionData.peerDependencies || {},
      repository: versionData.repository,
      homepage: versionData.homepage,
      license: versionData.license,
      keywords: versionData.keywords || [],
      maintainers: packageData.maintainers || [],
      time: packageData.time,
      versions: Object.keys(packageData.versions)
    };

    packageCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`Error fetching package data for ${packageName}:`, error.message);
    throw error;
  }
}

// Recursively build dependency tree
async function buildDependencyTree(packageName, version = 'latest', depth = 0, maxDepth = 3, visited = new Set()) {
  if (depth > maxDepth) {
    return null;
  }

  const nodeId = `${packageName}@${version}`;
  if (visited.has(nodeId)) {
    return { name: packageName, version, circular: true };
  }

  // Check cache for dependency tree at root level
  if (depth === 0) {
    const treeCacheKey = `tree-${packageName}-${version}-${maxDepth}`;
    const cachedTree = dependencyTreeCache.get(treeCacheKey);
    if (cachedTree) {
      return cachedTree;
    }
  }

  visited.add(nodeId);

  try {
    const packageData = await fetchPackageData(packageName, version);
    
    // Get vulnerability information for this package
    const vulnerabilityData = await checkVulnerabilities(packageName, packageData.version);
    
    const node = {
      name: packageName,
      version: packageData.version,
      description: packageData.description,
      license: packageData.license,
      dependencies: [],
      devDependencies: [],
      vulnerabilities: vulnerabilityData.vulnerabilities || [],
      vulnerability_count: vulnerabilityData.total_count || 0,
      severity_counts: vulnerabilityData.severity_counts || {},
      security_score: securityService.getSecurityScore(vulnerabilityData.vulnerabilities || []),
      depth
    };

    // Process dependencies
    for (const [depName, depVersion] of Object.entries(packageData.dependencies)) {
      const cleanVersion = semver.validRange(depVersion) ? semver.minVersion(depVersion)?.version || 'latest' : 'latest';
      const childNode = await buildDependencyTree(depName, cleanVersion, depth + 1, maxDepth, new Set(visited));
      if (childNode) {
        node.dependencies.push(childNode);
      }
    }

    // Cache the tree at root level
    if (depth === 0) {
      const treeCacheKey = `tree-${packageName}-${version}-${maxDepth}`;
      dependencyTreeCache.set(treeCacheKey, node);
    }

    return node;
  } catch (error) {
    console.error(`Error building tree for ${packageName}:`, error.message);
    return {
      name: packageName,
      version,
      error: error.message,
      depth
    };
  }
}

// Enhanced vulnerability checking using security service
async function checkVulnerabilities(packageName, version) {
  const vulnCacheKey = `vuln-${packageName}-${version}`;
  const cached = vulnerabilityCache.get(vulnCacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const vulnerabilityData = await securityService.getVulnerabilities(packageName, version);
    vulnerabilityCache.set(vulnCacheKey, vulnerabilityData);
    return vulnerabilityData;
  } catch (error) {
    console.error(`Error checking vulnerabilities for ${packageName}:`, error.message);
    return {
      package: packageName,
      version,
      vulnerabilities: [],
      total_count: 0,
      severity_counts: {},
      error: error.message
    };
  }
}

// API Routes

// Get package information
app.get('/api/package/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { version = 'latest' } = req.query;
    
    const packageData = await fetchPackageData(name, version);
    res.json(packageData);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Get dependency tree
app.get('/api/tree/:name', treeLimiter, async (req, res) => {
  try {
    const { name } = req.params;
    const { version = 'latest', depth = 3 } = req.query;
    
    console.log(`Building dependency tree for ${name}@${version} with depth ${depth}`);
    const tree = await buildDependencyTree(name, version, 0, parseInt(depth));
    res.json(tree);
  } catch (error) {
    console.error('Error building dependency tree:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search packages
app.get('/api/search/:query', searchLimiter, async (req, res) => {
  try {
    const { query } = req.params;
    const searchCacheKey = `search-${query.toLowerCase()}`;
    const cached = searchCache.get(searchCacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const response = await axios.get(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=20`);
    
    const results = response.data.objects.map(obj => ({
      name: obj.package.name,
      version: obj.package.version,
      description: obj.package.description,
      keywords: obj.package.keywords || [],
      score: obj.score
    }));
    
    searchCache.set(searchCacheKey, results);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vulnerability information
app.get('/api/vulnerabilities/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { version = 'latest' } = req.query;
    
    const vulnerabilities = await checkVulnerabilities(name, version);
    res.json(vulnerabilities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Cache statistics endpoint for monitoring
app.get('/api/cache/stats', (req, res) => {
  res.json({
    packageCache: {
      keys: packageCache.keys().length,
      stats: packageCache.getStats()
    },
    searchCache: {
      keys: searchCache.keys().length,
      stats: searchCache.getStats()
    },
    vulnerabilityCache: {
      keys: vulnerabilityCache.keys().length,
      stats: vulnerabilityCache.getStats()
    },
    dependencyTreeCache: {
      keys: dependencyTreeCache.keys().length,
      stats: dependencyTreeCache.getStats()
    }
  });
});

// Cache flush endpoint (for development/testing)
app.post('/api/cache/flush', (req, res) => {
  const { type } = req.body;
  
  switch (type) {
  case 'package':
    packageCache.flushAll();
    break;
  case 'search':
    searchCache.flushAll();
    break;
  case 'vulnerability':
    vulnerabilityCache.flushAll();
    break;
  case 'tree':
    dependencyTreeCache.flushAll();
    break;
  case 'all':
  default:
    packageCache.flushAll();
    searchCache.flushAll();
    vulnerabilityCache.flushAll();
    dependencyTreeCache.flushAll();
    break;
  }
  
  res.json({ message: `Cache ${type || 'all'} flushed successfully` });
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;

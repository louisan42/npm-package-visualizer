const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
const semver = require('semver');
const NodeCache = require('node-cache');
const securityService = require('./services/securityService');

const app = express();
const PORT = process.env.PORT || 3001;

// Cache for 10 minutes
const cache = new NodeCache({ stdTTL: 600 });

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// NPM Registry API base URL
const NPM_REGISTRY = 'https://registry.npmjs.org';
const NPM_AUDIT_API = 'https://registry.npmjs.org/-/npm/v1/security/audits';

// Utility function to fetch package data from npm registry
async function fetchPackageData(packageName, version = 'latest') {
  const cacheKey = `package-${packageName}-${version}`;
  const cached = cache.get(cacheKey);
  
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

    cache.set(cacheKey, result);
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
  try {
    const vulnerabilityData = await securityService.getVulnerabilities(packageName, version);
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
app.get('/api/dependencies/:name', async (req, res) => {
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
app.get('/api/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const response = await axios.get(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=20`);
    
    const results = response.data.objects.map(obj => ({
      name: obj.package.name,
      version: obj.package.version,
      description: obj.package.description,
      keywords: obj.package.keywords || [],
      score: obj.score
    }));
    
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

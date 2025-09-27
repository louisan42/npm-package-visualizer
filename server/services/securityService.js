const axios = require('axios');
const semver = require('semver');

class SecurityService {
  constructor() {
    this.vulnerabilityCache = new Map();
    this.advisoryCache = new Map();
  }

  // Check vulnerabilities using GitHub Advisory Database
  async checkGitHubAdvisories(packageName, version) {
    const cacheKey = `github-${packageName}-${version}`;
    
    if (this.advisoryCache.has(cacheKey)) {
      return this.advisoryCache.get(cacheKey);
    }

    try {
      // GitHub Advisory Database API
      const response = await axios.get(
        `https://api.github.com/advisories?ecosystem=npm&affects=${packageName}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'npm-package-visualizer'
          },
          timeout: 5000
        }
      );

      const advisories = response.data || [];
      const vulnerabilities = [];

      for (const advisory of advisories) {
        // Check if the current version is affected
        const affectedVersions = advisory.vulnerabilities
          ?.filter(vuln => vuln.package?.name === packageName)
          ?.map(vuln => vuln.vulnerable_version_range) || [];

        const isAffected = affectedVersions.some(range => {
          try {
            return semver.satisfies(version, range);
          } catch (error) {
            return false;
          }
        });

        if (isAffected) {
          vulnerabilities.push({
            id: advisory.ghsa_id,
            title: advisory.summary,
            description: advisory.description,
            severity: advisory.severity?.toLowerCase() || 'unknown',
            cvss_score: advisory.cvss?.score || null,
            published_at: advisory.published_at,
            updated_at: advisory.updated_at,
            references: advisory.references?.map(ref => ref.url) || [],
            source: 'github'
          });
        }
      }

      this.advisoryCache.set(cacheKey, vulnerabilities);
      return vulnerabilities;

    } catch (error) {
      console.error(`Error fetching GitHub advisories for ${packageName}:`, error.message);
      return [];
    }
  }

  // Check npm audit for vulnerabilities
  async checkNpmAudit(packageName, version) {
    const cacheKey = `npm-audit-${packageName}-${version}`;
    
    if (this.vulnerabilityCache.has(cacheKey)) {
      return this.vulnerabilityCache.get(cacheKey);
    }

    try {
      // Create a minimal package.json for audit
      const auditPayload = {
        name: 'temp-audit',
        version: '1.0.0',
        dependencies: {
          [packageName]: version
        }
      };

      const response = await axios.post(
        'https://registry.npmjs.org/-/npm/v1/security/audits',
        auditPayload,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const auditResult = response.data;
      const vulnerabilities = [];

      if (auditResult.advisories) {
        Object.values(auditResult.advisories).forEach(advisory => {
          if (advisory.module_name === packageName) {
            vulnerabilities.push({
              id: advisory.id,
              title: advisory.title,
              description: advisory.overview,
              severity: advisory.severity,
              cvss_score: advisory.cvss,
              vulnerable_versions: advisory.vulnerable_versions,
              patched_versions: advisory.patched_versions,
              published_at: advisory.created,
              updated_at: advisory.updated,
              references: advisory.references ? [advisory.references] : [],
              source: 'npm'
            });
          }
        });
      }

      this.vulnerabilityCache.set(cacheKey, vulnerabilities);
      return vulnerabilities;

    } catch (error) {
      console.error(`Error running npm audit for ${packageName}:`, error.message);
      return [];
    }
  }

  // Get comprehensive vulnerability information
  async getVulnerabilities(packageName, version = 'latest') {
    try {
      const [githubVulns, npmVulns] = await Promise.allSettled([
        this.checkGitHubAdvisories(packageName, version),
        this.checkNpmAudit(packageName, version)
      ]);

      const allVulnerabilities = [
        ...(githubVulns.status === 'fulfilled' ? githubVulns.value : []),
        ...(npmVulns.status === 'fulfilled' ? npmVulns.value : [])
      ];

      // Remove duplicates based on title or ID
      const uniqueVulns = allVulnerabilities.reduce((acc, vuln) => {
        const key = vuln.id || vuln.title;
        if (!acc.some(existing => existing.id === vuln.id || existing.title === vuln.title)) {
          acc.push(vuln);
        }
        return acc;
      }, []);

      // Sort by severity
      const severityOrder = { critical: 4, high: 3, moderate: 2, medium: 2, low: 1, unknown: 0 };
      uniqueVulns.sort((a, b) => (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0));

      return {
        package: packageName,
        version,
        vulnerabilities: uniqueVulns,
        total_count: uniqueVulns.length,
        severity_counts: this.countBySeverity(uniqueVulns),
        last_checked: new Date().toISOString()
      };

    } catch (error) {
      console.error(`Error getting vulnerabilities for ${packageName}:`, error.message);
      return {
        package: packageName,
        version,
        vulnerabilities: [],
        total_count: 0,
        severity_counts: {},
        error: error.message,
        last_checked: new Date().toISOString()
      };
    }
  }

  // Count vulnerabilities by severity
  countBySeverity(vulnerabilities) {
    return vulnerabilities.reduce((counts, vuln) => {
      const severity = vuln.severity || 'unknown';
      counts[severity] = (counts[severity] || 0) + 1;
      return counts;
    }, {});
  }

  // Check if a package version is outdated
  async checkOutdatedVersion(packageName, currentVersion) {
    try {
      const response = await axios.get(`https://registry.npmjs.org/${packageName}`);
      const packageData = response.data;
      const latestVersion = packageData['dist-tags'].latest;

      return {
        current: currentVersion,
        latest: latestVersion,
        is_outdated: semver.lt(currentVersion, latestVersion),
        versions_behind: semver.diff(currentVersion, latestVersion)
      };
    } catch (error) {
      return {
        current: currentVersion,
        latest: 'unknown',
        is_outdated: false,
        error: error.message
      };
    }
  }

  // Get security score for a package
  getSecurityScore(vulnerabilities, isOutdated = false) {
    let score = 100;

    vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'moderate':
        case 'medium':
          score -= 8;
          break;
        case 'low':
          score -= 3;
          break;
        default:
          score -= 1;
      }
    });

    if (isOutdated) {
      score -= 5;
    }

    return Math.max(0, score);
  }
}

module.exports = new SecurityService();

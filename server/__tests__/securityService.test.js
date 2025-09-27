// Security Service Tests
const axios = require('axios');
const securityService = require('../services/securityService');

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('SecurityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear cache before each test
    securityService.vulnerabilityCache?.clear?.();
    securityService.advisoryCache?.clear?.();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('checkGitHubAdvisories', () => {
    test('should return vulnerabilities for affected package', async () => {
      const mockAdvisories = [
        {
          ghsa_id: 'GHSA-test-1234',
          summary: 'Test vulnerability',
          description: 'Test description',
          severity: 'high',
          cvss: { score: 7.5 },
          published_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          references: [{ url: 'https://example.com' }],
          vulnerabilities: [
            {
              package: { name: 'test-package' },
              vulnerable_version_range: '< 1.0.0'
            }
          ]
        }
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mockAdvisories });

      const result = await securityService.checkGitHubAdvisories('test-package', '0.9.0');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'GHSA-test-1234',
        title: 'Test vulnerability',
        severity: 'high'
      });
    });

    test('should return empty array for unaffected package', async () => {
      const mockAdvisories = [
        {
          ghsa_id: 'GHSA-test-1234',
          summary: 'Test vulnerability',
          vulnerabilities: [
            {
              package: { name: 'other-package' },
              vulnerable_version_range: '< 1.0.0'
            }
          ]
        }
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mockAdvisories });

      const result = await securityService.checkGitHubAdvisories('test-package', '1.0.0');

      expect(result).toHaveLength(0);
    });

    test('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      const result = await securityService.checkGitHubAdvisories('test-package', '1.0.0');

      expect(result).toEqual([]);
    });

    test('should use cache for repeated requests', async () => {
      const mockAdvisories = [];
      mockedAxios.get.mockResolvedValueOnce({ data: mockAdvisories });

      // First call
      await securityService.checkGitHubAdvisories('test-package', '1.0.0');
      // Second call
      await securityService.checkGitHubAdvisories('test-package', '1.0.0');

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkNpmAudit', () => {
    test('should return vulnerabilities from npm audit', async () => {
      const mockAuditResult = {
        advisories: {
          '1234': {
            id: 1234,
            title: 'Test NPM vulnerability',
            overview: 'Test overview',
            severity: 'moderate',
            cvss: 5.0,
            module_name: 'test-package',
            vulnerable_versions: '< 1.0.0',
            patched_versions: '>= 1.0.0',
            created: '2023-01-01T00:00:00Z',
            updated: '2023-01-01T00:00:00Z',
            references: 'https://example.com'
          }
        }
      };

      mockedAxios.post.mockResolvedValueOnce({ data: mockAuditResult });

      const result = await securityService.checkNpmAudit('test-package', '0.9.0');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1234,
        title: 'Test NPM vulnerability',
        severity: 'moderate',
        source: 'npm'
      });
    });

    test('should handle audit API errors', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Audit API Error'));

      const result = await securityService.checkNpmAudit('test-package', '1.0.0');

      expect(result).toEqual([]);
    });
  });

  describe('getVulnerabilities', () => {
    test('should combine vulnerabilities from multiple sources', async () => {
      const githubVulns = [
        { id: 'GHSA-1', title: 'GitHub vuln', severity: 'high', source: 'github' }
      ];
      const npmVulns = [
        { id: '1234', title: 'NPM vuln', severity: 'moderate', source: 'npm' }
      ];

      jest.spyOn(securityService, 'checkGitHubAdvisories').mockResolvedValueOnce(githubVulns);
      jest.spyOn(securityService, 'checkNpmAudit').mockResolvedValueOnce(npmVulns);

      const result = await securityService.getVulnerabilities('test-package', '1.0.0');

      expect(result.vulnerabilities).toHaveLength(2);
      expect(result.total_count).toBe(2);
      expect(result.severity_counts).toEqual({
        high: 1,
        moderate: 1
      });
    });

    test('should remove duplicate vulnerabilities', async () => {
      const duplicateVulns = [
        { id: 'SAME-1', title: 'Same vuln', severity: 'high' },
        { id: 'SAME-1', title: 'Same vuln', severity: 'high' }
      ];

      jest.spyOn(securityService, 'checkGitHubAdvisories').mockResolvedValueOnce(duplicateVulns);
      jest.spyOn(securityService, 'checkNpmAudit').mockResolvedValueOnce([]);

      const result = await securityService.getVulnerabilities('test-package', '1.0.0');

      expect(result.vulnerabilities).toHaveLength(1);
    });

    test('should sort vulnerabilities by severity', async () => {
      const unsortedVulns = [
        { id: '1', title: 'Low vuln', severity: 'low' },
        { id: '2', title: 'Critical vuln', severity: 'critical' },
        { id: '3', title: 'High vuln', severity: 'high' }
      ];

      jest.spyOn(securityService, 'checkGitHubAdvisories').mockResolvedValueOnce(unsortedVulns);
      jest.spyOn(securityService, 'checkNpmAudit').mockResolvedValueOnce([]);

      const result = await securityService.getVulnerabilities('test-package', '1.0.0');

      expect(result.vulnerabilities[0].severity).toBe('critical');
      expect(result.vulnerabilities[1].severity).toBe('high');
      expect(result.vulnerabilities[2].severity).toBe('low');
    });
  });

  describe('countBySeverity', () => {
    test('should count vulnerabilities by severity', () => {
      const vulnerabilities = [
        { severity: 'high' },
        { severity: 'high' },
        { severity: 'moderate' },
        { severity: 'low' },
        { severity: undefined }
      ];

      const result = securityService.countBySeverity(vulnerabilities);

      expect(result).toEqual({
        high: 2,
        moderate: 1,
        low: 1,
        unknown: 1
      });
    });
  });

  describe('checkOutdatedVersion', () => {
    test('should detect outdated version', async () => {
      const mockPackageData = {
        'dist-tags': { latest: '2.0.0' }
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockPackageData });

      const result = await securityService.checkOutdatedVersion('test-package', '1.0.0');

      expect(result.is_outdated).toBe(true);
      expect(result.latest).toBe('2.0.0');
    });

    test('should handle current version', async () => {
      const mockPackageData = {
        'dist-tags': { latest: '1.0.0' }
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockPackageData });

      const result = await securityService.checkOutdatedVersion('test-package', '1.0.0');

      expect(result.is_outdated).toBe(false);
    });
  });

  describe('getSecurityScore', () => {
    test('should calculate security score based on vulnerabilities', () => {
      const vulnerabilities = [
        { severity: 'critical' },
        { severity: 'high' },
        { severity: 'moderate' },
        { severity: 'low' }
      ];

      const score = securityService.getSecurityScore(vulnerabilities, false);

      // 100 - 25 (critical) - 15 (high) - 8 (moderate) - 3 (low) = 49
      expect(score).toBe(49);
    });

    test('should penalize outdated packages', () => {
      const vulnerabilities = [];
      const score = securityService.getSecurityScore(vulnerabilities, true);

      expect(score).toBe(95); // 100 - 5 (outdated)
    });

    test('should not go below 0', () => {
      const manyVulns = Array(10).fill({ severity: 'critical' });
      const score = securityService.getSecurityScore(manyVulns, true);

      expect(score).toBe(0);
    });
  });
});

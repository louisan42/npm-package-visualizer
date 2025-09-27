// Server API Tests
const request = require('supertest');
const axios = require('axios');

// Mock dependencies before importing the server
jest.mock('axios');
jest.mock('../services/securityService');

const mockedAxios = axios;
const mockSecurityService = require('../services/securityService');

// Import server after mocking
const app = require('../index');

describe('NPM Package Visualizer API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'OK',
        timestamp: expect.any(String)
      });
    });
  });

  describe('GET /api/package/:name', () => {
    test('should return package information', async () => {
      const mockPackageData = {
        name: 'test-package',
        versions: {
          '1.0.0': {
            version: '1.0.0',
            description: 'Test package',
            dependencies: { 'dep1': '^1.0.0' },
            devDependencies: {},
            peerDependencies: {},
            repository: { url: 'https://github.com/test/repo' },
            homepage: 'https://test.com',
            license: 'MIT',
            keywords: ['test']
          }
        },
        'dist-tags': { latest: '1.0.0' },
        maintainers: [{ name: 'test', email: 'test@test.com' }],
        time: { '1.0.0': '2023-01-01T00:00:00Z' }
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockPackageData });

      const response = await request(app)
        .get('/api/package/test-package')
        .expect(200);

      expect(response.body).toMatchObject({
        name: 'test-package',
        version: '1.0.0',
        description: 'Test package',
        dependencies: { 'dep1': '^1.0.0' },
        license: 'MIT'
      });
    });

    test('should handle package not found', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Package not found'));

      const response = await request(app)
        .get('/api/package/nonexistent-package')
        .expect(404);

      expect(response.body).toMatchObject({
        error: expect.any(String)
      });
    });

    test('should handle specific version request', async () => {
      const mockPackageData = {
        name: 'test-package',
        versions: {
          '1.0.0': {
            version: '1.0.0',
            description: 'Test package v1',
            dependencies: {},
            devDependencies: {},
            peerDependencies: {}
          },
          '2.0.0': {
            version: '2.0.0',
            description: 'Test package v2',
            dependencies: {},
            devDependencies: {},
            peerDependencies: {}
          }
        },
        'dist-tags': { latest: '2.0.0' },
        maintainers: [],
        time: {}
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockPackageData });

      const response = await request(app)
        .get('/api/package/test-package?version=1.0.0')
        .expect(200);

      expect(response.body.version).toBe('1.0.0');
      expect(response.body.description).toBe('Test package v1');
    });
  });

  describe('GET /api/search/:query', () => {
    test('should return search results', async () => {
      const mockSearchResults = {
        objects: [
          {
            package: {
              name: 'test-package',
              version: '1.0.0',
              description: 'Test package',
              keywords: ['test']
            },
            score: { final: 0.8 }
          },
          {
            package: {
              name: 'another-package',
              version: '2.0.0',
              description: 'Another test package',
              keywords: ['test', 'another']
            },
            score: { final: 0.6 }
          }
        ]
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockSearchResults });

      const response = await request(app)
        .get('/api/search/test')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        name: 'test-package',
        version: '1.0.0',
        description: 'Test package',
        keywords: ['test'],
        score: { final: 0.8 }
      });
    });

    test('should handle search API errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Search API Error'));

      const response = await request(app)
        .get('/api/search/test')
        .expect(500);

      expect(response.body).toMatchObject({
        error: expect.any(String)
      });
    });
  });

  describe('GET /api/dependencies/:name', () => {
    test('should return dependency tree', async () => {
      const mockPackageData = {
        name: 'test-package',
        versions: {
          '1.0.0': {
            version: '1.0.0',
            description: 'Test package',
            dependencies: { 'dep1': '^1.0.0' },
            devDependencies: {},
            peerDependencies: {},
            license: 'MIT'
          }
        },
        'dist-tags': { latest: '1.0.0' },
        maintainers: [],
        time: {}
      };

      const mockDepPackageData = {
        name: 'dep1',
        versions: {
          '1.0.0': {
            version: '1.0.0',
            description: 'Dependency package',
            dependencies: {},
            devDependencies: {},
            peerDependencies: {},
            license: 'MIT'
          }
        },
        'dist-tags': { latest: '1.0.0' },
        maintainers: [],
        time: {}
      };

      const mockVulnerabilityData = {
        vulnerabilities: [],
        total_count: 0,
        severity_counts: {}
      };

      mockedAxios.get
        .mockResolvedValueOnce({ data: mockPackageData })
        .mockResolvedValueOnce({ data: mockDepPackageData });

      mockSecurityService.getVulnerabilities.mockResolvedValue(mockVulnerabilityData);
      mockSecurityService.getSecurityScore.mockReturnValue(100);

      const response = await request(app)
        .get('/api/dependencies/test-package')
        .expect(200);

      expect(response.body).toMatchObject({
        name: 'test-package',
        version: '1.0.0',
        dependencies: expect.any(Array),
        vulnerabilities: [],
        vulnerability_count: 0,
        security_score: 100
      });
    });

    test('should handle dependency tree depth limit', async () => {
      const mockPackageData = {
        name: 'test-package',
        versions: {
          '1.0.0': {
            version: '1.0.0',
            description: 'Test package',
            dependencies: {},
            devDependencies: {},
            peerDependencies: {},
            license: 'MIT'
          }
        },
        'dist-tags': { latest: '1.0.0' },
        maintainers: [],
        time: {}
      };

      const mockVulnerabilityData = {
        vulnerabilities: [],
        total_count: 0,
        severity_counts: {}
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockPackageData });
      mockSecurityService.getVulnerabilities.mockResolvedValue(mockVulnerabilityData);
      mockSecurityService.getSecurityScore.mockReturnValue(100);

      const response = await request(app)
        .get('/api/dependencies/test-package?depth=1')
        .expect(200);

      expect(response.body.depth).toBe(0);
    });

    test('should handle package not found in dependency tree', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Package not found'));

      const response = await request(app)
        .get('/api/dependencies/nonexistent-package')
        .expect(500);

      expect(response.body).toMatchObject({
        error: expect.any(String)
      });
    });
  });

  describe('GET /api/vulnerabilities/:name', () => {
    test('should return vulnerability information', async () => {
      const mockVulnerabilityData = {
        package: 'test-package',
        version: '1.0.0',
        vulnerabilities: [
          {
            id: 'GHSA-test-1234',
            title: 'Test vulnerability',
            severity: 'high',
            source: 'github'
          }
        ],
        total_count: 1,
        severity_counts: { high: 1 }
      };

      mockSecurityService.getVulnerabilities.mockResolvedValueOnce(mockVulnerabilityData);

      const response = await request(app)
        .get('/api/vulnerabilities/test-package')
        .expect(200);

      expect(response.body).toMatchObject({
        package: 'test-package',
        vulnerabilities: expect.any(Array),
        total_count: 1
      });
    });

    test('should handle vulnerability check errors', async () => {
      mockSecurityService.getVulnerabilities.mockRejectedValueOnce(new Error('Vulnerability API Error'));

      const response = await request(app)
        .get('/api/vulnerabilities/test-package')
        .expect(500);

      expect(response.body).toMatchObject({
        error: expect.any(String)
      });
    });
  });

  describe('Error handling', () => {
    test('should handle 404 for unknown routes', async () => {
      await request(app)
        .get('/api/unknown-endpoint')
        .expect(404);
    });
  });
});

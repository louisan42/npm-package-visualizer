// Integration Tests
const request = require('supertest');

// Mock axios before importing the app
jest.mock('axios');
const axios = require('axios');
const mockedAxios = axios;

const app = require('../index');

// Integration tests with real API calls (but mocked for CI)
describe('Integration Tests', () => {
  beforeAll(() => {
    // Set longer timeout for integration tests
    jest.setTimeout(30000);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.setTimeout(5000);
  });

  describe('Full package analysis workflow', () => {
    test('should analyze a simple package end-to-end', async () => {
      // Mock the external API calls for consistent testing
      
      const mockPackageData = {
        name: 'lodash',
        versions: {
          '4.17.21': {
            version: '4.17.21',
            description: 'Lodash modular utilities.',
            dependencies: {},
            devDependencies: {},
            peerDependencies: {},
            repository: { url: 'https://github.com/lodash/lodash.git' },
            license: 'MIT',
            keywords: ['modules', 'stdlib', 'util']
          }
        },
        'dist-tags': { latest: '4.17.21' },
        maintainers: [{ name: 'jdalton', email: 'john.david.dalton@gmail.com' }],
        time: { '4.17.21': '2021-02-20T15:42:16.891Z' }
      };

      mockedAxios.get.mockResolvedValue({ data: mockPackageData });

      // Test package info endpoint
      const packageResponse = await request(app)
        .get('/api/package/lodash')
        .expect(200);

      expect(packageResponse.body).toMatchObject({
        name: 'lodash',
        version: '4.17.21',
        description: 'Lodash modular utilities.',
        license: 'MIT'
      });

      // Test dependency tree endpoint
      const treeResponse = await request(app)
        .get('/api/tree/lodash?depth=1')
        .expect(200);

      expect(treeResponse.body).toMatchObject({
        name: 'lodash',
        version: '4.17.21',
        dependencies: expect.any(Array),
        vulnerability_count: expect.any(Number),
        security_score: expect.any(Number)
      });
    });

    test('should handle package with dependencies', async () => {
      
      const mockExpressData = {
        name: 'express',
        versions: {
          '4.18.2': {
            version: '4.18.2',
            description: 'Fast, unopinionated, minimalist web framework',
            dependencies: {
              'accepts': '~1.3.8',
              'array-flatten': '1.1.1',
              'body-parser': '1.20.1'
            },
            devDependencies: {},
            peerDependencies: {},
            license: 'MIT'
          }
        },
        'dist-tags': { latest: '4.18.2' },
        maintainers: [],
        time: {}
      };

      const mockAcceptsData = {
        name: 'accepts',
        versions: {
          '1.3.8': {
            version: '1.3.8',
            description: 'Higher-level content negotiation',
            dependencies: {
              'mime-types': '~2.1.34',
              'negotiator': '0.6.3'
            },
            devDependencies: {},
            peerDependencies: {},
            license: 'MIT'
          }
        },
        'dist-tags': { latest: '1.3.8' },
        maintainers: [],
        time: {}
      };

      mockedAxios.get
        .mockResolvedValueOnce({ data: mockExpressData })
        .mockResolvedValueOnce({ data: mockAcceptsData });

      const response = await request(app)
        .get('/api/tree/express?depth=2')
        .expect(200);

      expect(response.body.name).toBe('express');
      expect(response.body.dependencies.length).toBeGreaterThan(0);
    }, 15000);
  });

  describe('Error scenarios', () => {
    test('should handle network timeouts gracefully', async () => {
      // Mock axios to reject with timeout error
      mockedAxios.get.mockRejectedValueOnce(new Error('ETIMEDOUT'));

      const response = await request(app)
        .get('/api/package/timeout-package');

      // Should return 404 with error message
      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        error: expect.any(String)
      });
    });

    test('should handle malformed package data', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { invalid: 'data' } });

      const response = await request(app)
        .get('/api/package/malformed-package')
        .expect(404);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('Performance tests', () => {
    test('should respond within reasonable time limits', async () => {
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

      // Clear any previous mocks and set up fresh mock
      mockedAxios.get.mockClear();
      mockedAxios.get.mockResolvedValueOnce({ data: mockPackageData });

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/package/test-package');

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Should return 200 and respond within 5 seconds
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('test-package');
      expect(responseTime).toBeLessThan(5000);
    });

    test('should handle concurrent requests', async () => {
      const mockPackageData = {
        name: 'concurrent-test',
        versions: {
          '1.0.0': {
            version: '1.0.0',
            description: 'Concurrent test package',
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

      // Clear previous mocks and set up persistent mock for multiple calls
      mockedAxios.get.mockClear();
      mockedAxios.get.mockResolvedValue({ data: mockPackageData });

      // Make 5 concurrent requests
      const promises = Array(5).fill().map(() =>
        request(app).get('/api/package/concurrent-test')
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.name).toBe('concurrent-test');
      });
    });
  });
});

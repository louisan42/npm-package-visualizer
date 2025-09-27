// Additional server utility tests
const request = require('supertest');
const axios = require('axios');

// Mock dependencies
jest.mock('axios');
jest.mock('../services/securityService');

const mockedAxios = axios;
const app = require('../index');

describe('Additional Server Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('API Error Handling', () => {
    test('should handle package API network errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

      const response = await request(app)
        .get('/api/package/network-error-package')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('should handle search API timeout', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('ETIMEDOUT'));

      const response = await request(app)
        .get('/api/search/timeout-test')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Cache Behavior', () => {
    test('should handle cache miss scenarios', async () => {
      const mockPackageData = {
        name: 'cache-test',
        versions: {
          '1.0.0': {
            version: '1.0.0',
            description: 'Cache test package',
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

      mockedAxios.get.mockResolvedValueOnce({ data: mockPackageData });

      const response = await request(app)
        .get('/api/package/cache-test')
        .expect(200);

      expect(response.body.name).toBe('cache-test');
      expect(mockedAxios.get).toHaveBeenCalledWith('https://registry.npmjs.org/cache-test');
    });
  });
});

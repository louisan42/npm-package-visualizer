# Testing Guide

## Overview

This project includes comprehensive testing infrastructure with Jest, ESLint, and CI/CD integration.

## Test Structure

```
server/__tests__/
├── simple.test.js          # Basic functionality tests
├── securityService.test.js # Security service unit tests
├── server.test.js          # API endpoint tests
└── integration.test.js     # End-to-end integration tests
```

## Running Tests

### Local Development

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI (no watch, with coverage)
npm run test:ci

# Run specific test file
npm test -- server/__tests__/simple.test.js
```

### Linting

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix
```

## Test Categories

### 1. Unit Tests (`securityService.test.js`)

Tests individual functions and methods in isolation:

- **Security Service**: Tests vulnerability checking, GitHub Advisory integration, npm audit
- **Caching**: Verifies caching mechanisms work correctly
- **Error Handling**: Tests graceful error handling and fallbacks

### 2. API Tests (`server.test.js`)

Tests HTTP endpoints and API functionality:

- **Health Check**: Basic server health endpoint
- **Package Info**: Package metadata retrieval
- **Search**: Package search functionality
- **Dependencies**: Dependency tree building
- **Vulnerabilities**: Security analysis endpoints

### 3. Integration Tests (`integration.test.js`)

Tests complete workflows and real-world scenarios:

- **End-to-End Workflows**: Complete package analysis flows
- **Error Scenarios**: Network timeouts, malformed data
- **Performance**: Response time and concurrent request handling

## Test Configuration

### Jest Configuration (`package.json`)

```json
{
  "jest": {
    "testEnvironment": "node",
    "collectCoverageFrom": [
      "server/**/*.js",
      "!server/__tests__/**",
      "!server/node_modules/**",
      "!**/node_modules/**"
    ],
    "coverageDirectory": "coverage",
    "coverageReporters": ["text", "lcov", "html"],
    "testMatch": ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

### ESLint Configuration (`.eslintrc.js`)

- **Environment**: Node.js, ES2021, Jest
- **Rules**: Consistent code style, error prevention
- **Test Overrides**: Relaxed rules for test files

## Mocking Strategy

### External Dependencies

- **Axios**: Mocked for HTTP requests to npm registry
- **Security Service**: Mocked for API endpoint tests
- **Console**: Mocked to reduce test noise

### Example Mock Usage

```javascript
// Mock axios for HTTP requests
jest.mock('axios');
const mockedAxios = axios;

// Setup mock response
mockedAxios.get.mockResolvedValueOnce({ data: mockData });

// Verify mock was called
expect(mockedAxios.get).toHaveBeenCalledWith(expectedUrl);
```

## Coverage Requirements

- **Branches**: 80% minimum
- **Functions**: 80% minimum
- **Lines**: 80% minimum
- **Statements**: 80% minimum

## CI/CD Integration

### GitHub Actions Workflow

The CI pipeline includes:

1. **Test Matrix**: Node.js 18.x and 20.x
2. **Linting**: ESLint checks
3. **Testing**: Full test suite with coverage
4. **SonarQube**: Code quality analysis
5. **Security**: npm audit and Snyk scanning

### SonarQube Configuration

- **Project Key**: `npm-package-visualizer`
- **Coverage Reports**: LCOV format
- **Quality Gate**: Enforced quality standards
- **Security Hotspots**: Automated security analysis

## Writing Tests

### Test Structure

```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
    jest.clearAllMocks();
  });

  test('should do something specific', async () => {
    // Arrange
    const mockData = { /* test data */ };
    mockedDependency.mockResolvedValue(mockData);

    // Act
    const result = await functionUnderTest();

    // Assert
    expect(result).toMatchObject(expectedResult);
    expect(mockedDependency).toHaveBeenCalledWith(expectedArgs);
  });
});
```

### Best Practices

1. **Descriptive Names**: Test names should clearly describe what is being tested
2. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
3. **Mock External Dependencies**: Isolate units under test
4. **Test Error Cases**: Include negative test cases and error scenarios
5. **Use Matchers**: Leverage Jest matchers for clear assertions

### Common Patterns

```javascript
// Testing async functions
test('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});

// Testing error handling
test('should handle errors gracefully', async () => {
  mockFunction.mockRejectedValue(new Error('Test error'));
  const result = await functionUnderTest();
  expect(result).toEqual(fallbackValue);
});

// Testing HTTP endpoints
test('should return expected response', async () => {
  const response = await request(app)
    .get('/api/endpoint')
    .expect(200);
  
  expect(response.body).toMatchObject(expectedShape);
});
```

## Debugging Tests

### Common Issues

1. **Port Conflicts**: Server already running on test port
   - Solution: Use `NODE_ENV=test` to prevent server startup

2. **Async Operations**: Tests hanging or timing out
   - Solution: Properly mock async dependencies and use `await`

3. **Mock Persistence**: Mocks affecting other tests
   - Solution: Clear mocks in `beforeEach` hooks

### Debug Commands

```bash
# Run tests with verbose output
npm test -- --verbose

# Run tests with open handles detection
npm test -- --detectOpenHandles

# Run specific test with debugging
node --inspect-brk node_modules/.bin/jest --runInBand server/__tests__/specific.test.js
```

## Performance Considerations

- **Test Isolation**: Each test should be independent
- **Mock External Calls**: Avoid real network requests in tests
- **Parallel Execution**: Tests run in parallel by default
- **Timeout Configuration**: Set appropriate timeouts for async operations

## Continuous Improvement

- **Coverage Reports**: Review coverage reports regularly
- **Test Maintenance**: Update tests when code changes
- **Performance Monitoring**: Track test execution time
- **Quality Metrics**: Monitor SonarQube quality gate status

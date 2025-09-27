import {
  formatDate,
  getRepositoryUrl,
  truncateText,
  getVulnerabilityColor,
  getStatusColor,
  checkVersionSatisfies,
  debounce,
  generateTooltipContent,
  findDependencyInTree,
  calculateNodeSize,
  calculateFontSize,
  isValidPackageName,
  getEmptyStateText
} from '../helpers';
import { colors } from '../../theme/constants';

describe('Helper Functions', () => {
  describe('formatDate', () => {
    test('formats valid ISO date string', () => {
      const result = formatDate('2023-01-01T12:00:00.000Z');
      // Use a more flexible test that works across timezones
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/2023/);
    });

    test('returns "Unknown" for null input', () => {
      const result = formatDate(null);
      expect(result).toBe('Unknown');
    });

    test('returns "Unknown" for undefined input', () => {
      const result = formatDate(undefined);
      expect(result).toBe('Unknown');
    });

    test('returns "Invalid Date" for invalid date string', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('Invalid Date');
    });
  });

  describe('getRepositoryUrl', () => {
    test('returns null for null input', () => {
      const result = getRepositoryUrl(null);
      expect(result).toBeNull();
    });

    test('returns string input as-is', () => {
      const url = 'https://github.com/test/repo';
      const result = getRepositoryUrl(url);
      expect(result).toBe(url);
    });

    test('extracts URL from repository object', () => {
      const repo = {
        type: 'git',
        url: 'git+https://github.com/test/repo.git'
      };
      const result = getRepositoryUrl(repo);
      expect(result).toBe('https://github.com/test/repo');
    });

    test('removes git+ prefix and .git suffix', () => {
      const repo = {
        url: 'git+https://github.com/test/repo.git'
      };
      const result = getRepositoryUrl(repo);
      expect(result).toBe('https://github.com/test/repo');
    });

    test('returns null for object without url', () => {
      const repo = { type: 'git' };
      const result = getRepositoryUrl(repo);
      expect(result).toBeNull();
    });
  });

  describe('truncateText', () => {
    test('returns original text if shorter than max length', () => {
      const result = truncateText('short', 15);
      expect(result).toBe('short');
    });

    test('truncates text longer than max length', () => {
      const result = truncateText('this is a very long text', 10);
      expect(result).toBe('this is a ...');
    });

    test('uses default max length of 15', () => {
      const result = truncateText('this is a very long text');
      expect(result).toBe('this is a very ...');
    });

    test('returns empty string for null input', () => {
      const result = truncateText(null);
      expect(result).toBe('');
    });

    test('returns empty string for undefined input', () => {
      const result = truncateText(undefined);
      expect(result).toBe('');
    });
  });

  describe('getVulnerabilityColor', () => {
    test('returns success color for no vulnerabilities', () => {
      const result = getVulnerabilityColor({}, 0);
      expect(result).toBe(colors.success);
    });

    test('returns critical color for critical vulnerabilities', () => {
      const result = getVulnerabilityColor({ critical: 1 }, 1);
      expect(result).toBe(colors.critical);
    });

    test('returns high color for high vulnerabilities', () => {
      const result = getVulnerabilityColor({ high: 1 }, 1);
      expect(result).toBe(colors.high);
    });

    test('returns moderate color for moderate vulnerabilities', () => {
      const result = getVulnerabilityColor({ moderate: 1 }, 1);
      expect(result).toBe(colors.moderate);
    });

    test('returns moderate color for medium vulnerabilities', () => {
      const result = getVulnerabilityColor({ medium: 1 }, 1);
      expect(result).toBe(colors.moderate);
    });

    test('returns low color for low vulnerabilities', () => {
      const result = getVulnerabilityColor({ low: 1 }, 1);
      expect(result).toBe(colors.low);
    });

    test('returns unknown color for unknown severity', () => {
      const result = getVulnerabilityColor({ unknown: 1 }, 1);
      expect(result).toBe(colors.unknown);
    });

    test('prioritizes higher severity', () => {
      const result = getVulnerabilityColor({ critical: 1, high: 2, low: 3 }, 6);
      expect(result).toBe(colors.critical);
    });
  });

  describe('getStatusColor', () => {
    test('returns compatible color for compatible status', () => {
      const result = getStatusColor('compatible');
      expect(result).toBe(colors.compatible);
    });

    test('returns incompatible color for incompatible status', () => {
      const result = getStatusColor('incompatible');
      expect(result).toBe(colors.incompatible);
    });

    test('returns warning color for warning status', () => {
      const result = getStatusColor('warning');
      expect(result).toBe(colors.warning);
    });

    test('returns unknown color for unknown status', () => {
      const result = getStatusColor('unknown');
      expect(result).toBe(colors.unknown);
    });
  });

  describe('checkVersionSatisfies', () => {
    test('handles caret range correctly', () => {
      expect(checkVersionSatisfies('1.2.0', '^1.0.0')).toBe(true);
      expect(checkVersionSatisfies('0.9.0', '^1.0.0')).toBe(false);
    });

    test('handles tilde range correctly', () => {
      expect(checkVersionSatisfies('1.0.5', '~1.0.0')).toBe(true);
      expect(checkVersionSatisfies('2.0.0', '~1.0.0')).toBe(false);
    });

    test('handles exact version correctly', () => {
      expect(checkVersionSatisfies('1.0.0', '1.0.0')).toBe(true);
      expect(checkVersionSatisfies('1.0.1', '1.0.0')).toBe(false);
    });

    test('returns false for invalid input', () => {
      expect(checkVersionSatisfies(null, '^1.0.0')).toBe(false);
      expect(checkVersionSatisfies('1.0.0', null)).toBe(false);
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    test('delays function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('cancels previous calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('passes arguments correctly', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1', 'arg2');
      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });

  describe('generateTooltipContent', () => {
    test('generates content for node with vulnerabilities', () => {
      const nodeData = {
        name: 'test-package',
        version: '1.0.0',
        description: 'A test package',
        license: 'MIT',
        vulnerability_count: 2,
        severity_counts: { high: 1, low: 1 },
        security_score: 75
      };

      const result = generateTooltipContent(nodeData);
      
      expect(result).toContain('test-package');
      expect(result).toContain('Version: 1.0.0');
      expect(result).toContain('License: MIT');
      expect(result).toContain('🚨 2 vulnerabilities');
      expect(result).toContain('high: 1');
      expect(result).toContain('low: 1');
      expect(result).toContain('Security Score: 75/100');
    });

    test('generates content for node without vulnerabilities', () => {
      const nodeData = {
        name: 'safe-package',
        version: '2.0.0',
        vulnerability_count: 0
      };

      const result = generateTooltipContent(nodeData);
      
      expect(result).toContain('safe-package');
      expect(result).toContain('✅ No known vulnerabilities');
    });

    test('handles node with error', () => {
      const nodeData = {
        name: 'error-package',
        version: '1.0.0',
        error: 'Package not found'
      };

      const result = generateTooltipContent(nodeData);
      
      expect(result).toContain('Error: Package not found');
    });

    test('handles circular dependency', () => {
      const nodeData = {
        name: 'circular-package',
        version: '1.0.0',
        circular: true,
        vulnerability_count: 0
      };

      const result = generateTooltipContent(nodeData);
      
      expect(result).toContain('Circular dependency');
    });
  });

  describe('findDependencyInTree', () => {
    const mockTree = {
      name: 'root',
      dependencies: [
        {
          name: 'dep1',
          dependencies: [
            { name: 'nested-dep', dependencies: [] }
          ]
        },
        { name: 'dep2', dependencies: [] }
      ]
    };

    test('finds root node', () => {
      const result = findDependencyInTree(mockTree, 'root');
      expect(result).toBe(mockTree);
    });

    test('finds direct dependency', () => {
      const result = findDependencyInTree(mockTree, 'dep1');
      expect(result.name).toBe('dep1');
    });

    test('finds nested dependency', () => {
      const result = findDependencyInTree(mockTree, 'nested-dep');
      expect(result.name).toBe('nested-dep');
    });

    test('returns null for non-existent dependency', () => {
      const result = findDependencyInTree(mockTree, 'non-existent');
      expect(result).toBeNull();
    });
  });

  describe('calculateNodeSize', () => {
    test('returns base size for depth 0', () => {
      const result = calculateNodeSize(0, 20, 8);
      expect(result).toBe(20);
    });

    test('decreases size with depth', () => {
      const result = calculateNodeSize(2, 20, 8);
      expect(result).toBe(16);
    });

    test('respects minimum size', () => {
      const result = calculateNodeSize(10, 20, 8);
      expect(result).toBe(8);
    });
  });

  describe('calculateFontSize', () => {
    test('returns base size for depth 0', () => {
      const result = calculateFontSize(0, 14, 10);
      expect(result).toBe(14);
    });

    test('decreases size with depth', () => {
      const result = calculateFontSize(2, 14, 10);
      expect(result).toBe(12);
    });

    test('respects minimum size', () => {
      const result = calculateFontSize(10, 14, 10);
      expect(result).toBe(10);
    });
  });

  describe('isValidPackageName', () => {
    test('validates simple package names', () => {
      expect(isValidPackageName('lodash')).toBe(true);
      expect(isValidPackageName('react-dom')).toBe(true);
      expect(isValidPackageName('my-package')).toBe(true);
    });

    test('validates scoped package names', () => {
      expect(isValidPackageName('@babel/core')).toBe(true);
      expect(isValidPackageName('@types/node')).toBe(true);
    });

    test('rejects invalid package names', () => {
      expect(isValidPackageName('')).toBe(false);
      expect(isValidPackageName(null)).toBe(false);
      expect(isValidPackageName(undefined)).toBe(false);
      expect(isValidPackageName('UPPERCASE')).toBe(false);
      expect(isValidPackageName('package with spaces')).toBe(false);
      expect(isValidPackageName('package@version')).toBe(false);
    });

    test('handles non-string input', () => {
      expect(isValidPackageName(123)).toBe(false);
      expect(isValidPackageName({})).toBe(false);
      expect(isValidPackageName([])).toBe(false);
    });
  });

  describe('getEmptyStateText', () => {
    test('returns search empty state', () => {
      const result = getEmptyStateText('search');
      expect(result.title).toBe('Search for an npm package to get started');
      expect(result.description).toContain('Enter a package name');
    });

    test('returns dependencies empty state', () => {
      const result = getEmptyStateText('dependencies');
      expect(result.title).toBe('Dependency Tree Visualization');
      expect(result.description).toContain('Select a package');
    });

    test('returns no results empty state', () => {
      const result = getEmptyStateText('noResults');
      expect(result.title).toBe('No packages found');
      expect(result.description).toBe('Try a different search term');
    });

    test('returns error empty state', () => {
      const result = getEmptyStateText('error');
      expect(result.title).toBe('Something went wrong');
      expect(result.description).toContain('try again');
    });

    test('returns error state for unknown type', () => {
      const result = getEmptyStateText('unknown');
      expect(result.title).toBe('Something went wrong');
      expect(result.description).toContain('try again');
    });
  });
});

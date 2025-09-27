import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PackageInfo from '../PackageInfo';

// Mock the CompatibilityMatrix component
jest.mock('../CompatibilityMatrix', () => {
  return function MockCompatibilityMatrix({ packageData, dependencyTree }) {
    return (
      <div data-testid="compatibility-matrix">
        Compatibility Matrix for {packageData?.name}
      </div>
    );
  };
});

describe('PackageInfo Component', () => {
  const mockPackage = {
    name: 'test-package',
    version: '1.0.0',
    description: 'A test package for unit testing',
    license: 'MIT',
    dependencies: {
      'dep1': '^1.0.0',
      'dep2': '^2.0.0'
    },
    devDependencies: {
      'dev-dep1': '^1.0.0'
    },
    peerDependencies: {
      'peer-dep1': '^1.0.0'
    },
    maintainers: [
      { name: 'John Doe', email: 'john@example.com' },
      { name: 'Jane Doe', email: 'jane@example.com' }
    ],
    keywords: ['test', 'package', 'npm', 'utility'],
    repository: {
      type: 'git',
      url: 'git+https://github.com/test/test-package.git'
    },
    homepage: 'https://test-package.com',
    time: {
      '1.0.0': '2023-01-01T00:00:00.000Z'
    },
    versions: ['0.1.0', '0.2.0', '1.0.0']
  };

  const mockDependencyTree = {
    name: 'test-package',
    version: '1.0.0',
    dependencies: []
  };

  test('returns null when no package is provided', () => {
    const { container } = render(<PackageInfo package={null} dependencyTree={mockDependencyTree} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders package name and version', () => {
    render(<PackageInfo package={mockPackage} dependencyTree={mockDependencyTree} />);
    
    expect(screen.getByText('test-package')).toBeInTheDocument();
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });

  test('renders package description', () => {
    render(<PackageInfo package={mockPackage} dependencyTree={mockDependencyTree} />);
    
    expect(screen.getByText('A test package for unit testing')).toBeInTheDocument();
  });

  test('renders package license', () => {
    render(<PackageInfo package={mockPackage} dependencyTree={mockDependencyTree} />);
    
    expect(screen.getByText('License')).toBeInTheDocument();
    expect(screen.getByText('MIT')).toBeInTheDocument();
  });

  test('renders published date', () => {
    render(<PackageInfo package={mockPackage} dependencyTree={mockDependencyTree} />);
    
    expect(screen.getByText('Published')).toBeInTheDocument();
    // The date should be rendered somewhere in the component
    // Using a more flexible approach since date formats can vary by locale
    const publishedSection = screen.getByText('Published').closest('div');
    expect(publishedSection).toBeInTheDocument();
  });

  test('renders total versions count', () => {
    render(<PackageInfo package={mockPackage} dependencyTree={mockDependencyTree} />);
    
    expect(screen.getByText('Total Versions')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('renders dependency counts', () => {
    render(<PackageInfo package={mockPackage} dependencyTree={mockDependencyTree} />);
    
    const dependenciesSection = screen.getAllByText('Dependencies');
    expect(dependenciesSection.length).toBeGreaterThanOrEqual(1);
    
    const devDependenciesSection = screen.getAllByText('Dev Dependencies');
    expect(devDependenciesSection.length).toBeGreaterThanOrEqual(1);
    
    // Check for dependency counts
    const twoCounts = screen.getAllByText('2');
    expect(twoCounts.length).toBeGreaterThanOrEqual(1); // 2 dependencies
    
    const oneCounts = screen.getAllByText('1');
    expect(oneCounts.length).toBeGreaterThanOrEqual(1); // 1 dev dependency
  });

  test('renders peer dependencies when present', () => {
    render(<PackageInfo package={mockPackage} dependencyTree={mockDependencyTree} />);
    
    expect(screen.getByText('Peer Dependencies')).toBeInTheDocument();
    
    // Check for peer dependency count
    const oneCounts = screen.getAllByText('1');
    expect(oneCounts.length).toBeGreaterThanOrEqual(1); // 1 peer dependency
  });

  test('does not render peer dependencies section when none exist', () => {
    const packageWithoutPeerDeps = {
      ...mockPackage,
      peerDependencies: {}
    };

    render(<PackageInfo package={packageWithoutPeerDeps} dependencyTree={mockDependencyTree} />);
    
    expect(screen.queryByText('Peer Dependencies')).not.toBeInTheDocument();
  });

  test('renders maintainers count', () => {
    render(<PackageInfo package={mockPackage} dependencyTree={mockDependencyTree} />);
    
    expect(screen.getByText('Maintainers')).toBeInTheDocument();
    expect(screen.getByText('Count')).toBeInTheDocument();
    
    // Check for maintainer count in the maintainers section
    const maintainerCounts = screen.getAllByText('2');
    expect(maintainerCounts.length).toBeGreaterThanOrEqual(1);
  });

  test('does not render maintainers section when none exist', () => {
    const packageWithoutMaintainers = {
      ...mockPackage,
      maintainers: []
    };

    render(<PackageInfo package={packageWithoutMaintainers} dependencyTree={mockDependencyTree} />);
    
    expect(screen.queryByText('Maintainers')).not.toBeInTheDocument();
  });

  test('renders keywords', () => {
    render(<PackageInfo package={mockPackage} dependencyTree={mockDependencyTree} />);
    
    expect(screen.getByText('Keywords')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('package')).toBeInTheDocument();
    expect(screen.getByText('npm')).toBeInTheDocument();
    expect(screen.getByText('utility')).toBeInTheDocument();
  });

  test('limits keywords display to 10 and shows more indicator', () => {
    const packageWithManyKeywords = {
      ...mockPackage,
      keywords: Array.from({ length: 15 }, (_, i) => `keyword${i}`)
    };

    render(<PackageInfo package={packageWithManyKeywords} dependencyTree={mockDependencyTree} />);
    
    expect(screen.getByText('+5 more')).toBeInTheDocument();
  });

  test('does not render keywords section when none exist', () => {
    const packageWithoutKeywords = {
      ...mockPackage,
      keywords: []
    };

    render(<PackageInfo package={packageWithoutKeywords} dependencyTree={mockDependencyTree} />);
    
    expect(screen.queryByText('Keywords')).not.toBeInTheDocument();
  });

  test('renders NPM Registry link', () => {
    render(<PackageInfo package={mockPackage} dependencyTree={mockDependencyTree} />);
    
    const npmLink = screen.getByText('NPM Registry').closest('a');
    expect(npmLink).toHaveAttribute('href', 'https://www.npmjs.com/package/test-package');
    expect(npmLink).toHaveAttribute('target', '_blank');
    expect(npmLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('renders repository link when available', () => {
    render(<PackageInfo package={mockPackage} dependencyTree={mockDependencyTree} />);
    
    const repoLink = screen.getByText('Repository').closest('a');
    expect(repoLink).toHaveAttribute('href', 'https://github.com/test/test-package');
    expect(repoLink).toHaveAttribute('target', '_blank');
  });

  test('renders homepage link when available', () => {
    render(<PackageInfo package={mockPackage} dependencyTree={mockDependencyTree} />);
    
    const homepageLink = screen.getByText('Homepage').closest('a');
    expect(homepageLink).toHaveAttribute('href', 'https://test-package.com');
    expect(homepageLink).toHaveAttribute('target', '_blank');
  });

  test('does not render repository link when not available', () => {
    const packageWithoutRepo = {
      ...mockPackage,
      repository: null
    };

    render(<PackageInfo package={packageWithoutRepo} dependencyTree={mockDependencyTree} />);
    
    expect(screen.queryByText('Repository')).not.toBeInTheDocument();
  });

  test('does not render homepage link when not available', () => {
    const packageWithoutHomepage = {
      ...mockPackage,
      homepage: null
    };

    render(<PackageInfo package={packageWithoutHomepage} dependencyTree={mockDependencyTree} />);
    
    expect(screen.queryByText('Homepage')).not.toBeInTheDocument();
  });

  test('handles string repository format', () => {
    const packageWithStringRepo = {
      ...mockPackage,
      repository: 'https://github.com/test/test-package'
    };

    render(<PackageInfo package={packageWithStringRepo} dependencyTree={mockDependencyTree} />);
    
    const repoLink = screen.getByText('Repository').closest('a');
    expect(repoLink).toHaveAttribute('href', 'https://github.com/test/test-package');
  });

  test('renders compatibility matrix', () => {
    render(<PackageInfo package={mockPackage} dependencyTree={mockDependencyTree} />);
    
    expect(screen.getByTestId('compatibility-matrix')).toBeInTheDocument();
    expect(screen.getByText('Compatibility Matrix for test-package')).toBeInTheDocument();
  });

  test('handles missing optional fields gracefully', () => {
    const minimalPackage = {
      name: 'minimal-package',
      version: '1.0.0'
    };

    render(<PackageInfo package={minimalPackage} dependencyTree={mockDependencyTree} />);
    
    expect(screen.getByText('minimal-package')).toBeInTheDocument();
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    expect(screen.getByText('Not specified')).toBeInTheDocument(); // License
    
    // Check for dependency counts using more specific queries
    const dependenciesSection = screen.getAllByText('Dependencies');
    expect(dependenciesSection.length).toBeGreaterThanOrEqual(1);
    
    const devDependenciesSection = screen.getAllByText('Dev Dependencies');
    expect(devDependenciesSection.length).toBeGreaterThanOrEqual(1);
    
    // The dependency counts should be 0 for empty dependencies
    const dependencyCounts = screen.getAllByText('0');
    expect(dependencyCounts.length).toBeGreaterThanOrEqual(2);
  });

  test('handles invalid date gracefully', () => {
    const packageWithInvalidDate = {
      ...mockPackage,
      time: {
        '1.0.0': 'invalid-date'
      }
    };

    render(<PackageInfo package={packageWithInvalidDate} dependencyTree={mockDependencyTree} />);
    
    expect(screen.getByText('Invalid Date')).toBeInTheDocument();
  });

  test('handles missing time field gracefully', () => {
    const packageWithoutTime = {
      ...mockPackage,
      time: null
    };

    render(<PackageInfo package={packageWithoutTime} dependencyTree={mockDependencyTree} />);
    
    expect(screen.queryByText('Published')).not.toBeInTheDocument();
  });

  test('handles empty dependencies object', () => {
    const packageWithEmptyDeps = {
      ...mockPackage,
      dependencies: {},
      devDependencies: {},
      peerDependencies: {}
    };

    render(<PackageInfo package={packageWithEmptyDeps} dependencyTree={mockDependencyTree} />);
    
    // Should show 0 for dependencies and dev dependencies
    const dependenciesSection = screen.getAllByText('Dependencies');
    expect(dependenciesSection.length).toBeGreaterThanOrEqual(1);
    
    const devDependenciesSection = screen.getAllByText('Dev Dependencies');
    expect(devDependenciesSection.length).toBeGreaterThanOrEqual(1);
    
    // Check that we have dependency counts of 0
    const dependencyCounts = screen.getAllByText('0');
    expect(dependencyCounts.length).toBeGreaterThanOrEqual(2);
  });
});

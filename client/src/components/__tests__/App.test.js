import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';

// Mock the child components
jest.mock('../SearchBar', () => {
  return function MockSearchBar({ onPackageSelect }) {
    return (
      <div data-testid="search-bar">
        <button onClick={() => onPackageSelect('test-package', '1.0.0')}>
          Search Package
        </button>
      </div>
    );
  };
});

jest.mock('../DependencyTree', () => {
  return function MockDependencyTree({ data, onNodeClick }) {
    return (
      <div data-testid="dependency-tree">
        {data && <div>Tree for {data.name}</div>}
        <button onClick={() => onNodeClick('dep-package', '2.0.0')}>
          Click Node
        </button>
      </div>
    );
  };
});

jest.mock('../PackageInfo', () => {
  return function MockPackageInfo({ package: pkg }) {
    return (
      <div data-testid="package-info">
        {pkg && <div>Info for {pkg.name}</div>}
      </div>
    );
  };
});

jest.mock('../LoadingSpinner', () => {
  return function MockLoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

jest.mock('../ErrorMessage', () => {
  return function MockErrorMessage({ message }) {
    return <div data-testid="error-message">{message}</div>;
  };
});

// Mock fetch
global.fetch = jest.fn();

describe('App Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders app title and subtitle', () => {
    render(<App />);
    
    expect(screen.getByText('📦 NPM Package Visualizer')).toBeInTheDocument();
    expect(screen.getByText(/Explore npm package dependencies/)).toBeInTheDocument();
  });

  test('renders search bar', () => {
    render(<App />);
    
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  test('shows empty states initially', () => {
    render(<App />);
    
    expect(screen.getByText('Search for an npm package to get started')).toBeInTheDocument();
    expect(screen.getByText('Dependency Tree Visualization')).toBeInTheDocument();
  });

  test('handles package selection successfully', async () => {
    const mockPackageData = {
      name: 'test-package',
      version: '1.0.0',
      description: 'Test package'
    };

    const mockTreeData = {
      name: 'test-package',
      version: '1.0.0',
      dependencies: []
    };

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPackageData)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTreeData)
      });

    render(<App />);
    
    fireEvent.click(screen.getByText('Search Package'));

    // Should show loading initially
    await waitFor(() => {
      expect(screen.getAllByTestId('loading-spinner')).toHaveLength(2);
    });

    // Should show package info and dependency tree after loading
    await waitFor(() => {
      expect(screen.getByTestId('package-info')).toBeInTheDocument();
      expect(screen.getByTestId('dependency-tree')).toBeInTheDocument();
      expect(screen.getByText('Info for test-package')).toBeInTheDocument();
      expect(screen.getByText('Tree for test-package')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledWith('/api/package/test-package?version=1.0.0');
    expect(fetch).toHaveBeenCalledWith('/api/dependencies/test-package?version=1.0.0&depth=3');
  });

  test('handles package fetch error', async () => {
    fetch.mockRejectedValueOnce(new Error('Package not found'));

    render(<App />);
    
    fireEvent.click(screen.getByText('Search Package'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Package not found')).toBeInTheDocument();
    });
  });

  test('handles dependency tree fetch error', async () => {
    const mockPackageData = {
      name: 'test-package',
      version: '1.0.0',
      description: 'Test package'
    };

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPackageData)
      })
      .mockRejectedValueOnce(new Error('Failed to fetch dependencies'));

    render(<App />);
    
    fireEvent.click(screen.getByText('Search Package'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch dependencies')).toBeInTheDocument();
    });
  });

  test('handles node click in dependency tree', async () => {
    const mockPackageData = {
      name: 'test-package',
      version: '1.0.0',
      description: 'Test package'
    };

    const mockTreeData = {
      name: 'test-package',
      version: '1.0.0',
      dependencies: []
    };

    const mockDepPackageData = {
      name: 'dep-package',
      version: '2.0.0',
      description: 'Dependency package'
    };

    const mockDepTreeData = {
      name: 'dep-package',
      version: '2.0.0',
      dependencies: []
    };

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPackageData)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTreeData)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDepPackageData)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDepTreeData)
      });

    render(<App />);
    
    // First package selection
    fireEvent.click(screen.getByText('Search Package'));

    await waitFor(() => {
      expect(screen.getByText('Tree for test-package')).toBeInTheDocument();
    });

    // Click on dependency node
    fireEvent.click(screen.getByText('Click Node'));

    await waitFor(() => {
      expect(screen.getByText('Info for dep-package')).toBeInTheDocument();
      expect(screen.getByText('Tree for dep-package')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledTimes(4);
  });

  test('clears error when new package is selected', async () => {
    // First, trigger an error
    fetch.mockRejectedValueOnce(new Error('First error'));

    render(<App />);
    
    fireEvent.click(screen.getByText('Search Package'));

    await waitFor(() => {
      expect(screen.getByText('First error')).toBeInTheDocument();
    });

    // Then, make a successful request
    const mockPackageData = {
      name: 'test-package',
      version: '1.0.0',
      description: 'Test package'
    };

    const mockTreeData = {
      name: 'test-package',
      version: '1.0.0',
      dependencies: []
    };

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPackageData)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTreeData)
      });

    fireEvent.click(screen.getByText('Search Package'));

    await waitFor(() => {
      expect(screen.queryByText('First error')).not.toBeInTheDocument();
      expect(screen.getByText('Info for test-package')).toBeInTheDocument();
    });
  });

  test('handles non-ok response from package API', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    render(<App />);
    
    fireEvent.click(screen.getByText('Search Package'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Package not found')).toBeInTheDocument();
    });
  });

  test('handles non-ok response from dependencies API', async () => {
    const mockPackageData = {
      name: 'test-package',
      version: '1.0.0',
      description: 'Test package'
    };

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPackageData)
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500
      });

    render(<App />);
    
    fireEvent.click(screen.getByText('Search Package'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch dependencies')).toBeInTheDocument();
    });
  });
});

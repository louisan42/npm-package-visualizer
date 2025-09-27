import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchBar from '../SearchBar';

// Mock fetch
global.fetch = jest.fn();

describe('SearchBar Component', () => {
  const mockOnPackageSelect = jest.fn();

  beforeEach(() => {
    fetch.mockClear();
    mockOnPackageSelect.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders search input', () => {
    render(<SearchBar onPackageSelect={mockOnPackageSelect} />);
    
    const input = screen.getByPlaceholderText(/Search npm packages/);
    expect(input).toBeInTheDocument();
  });

  test('renders search icon', () => {
    render(<SearchBar onPackageSelect={mockOnPackageSelect} />);
    
    // The Lucide Search icon should be rendered
    const searchContainer = screen.getByRole('textbox').parentElement;
    const searchIcon = searchContainer.querySelector('svg');
    expect(searchIcon).toBeTruthy();
  });

  test('does not show results initially', () => {
    render(<SearchBar onPackageSelect={mockOnPackageSelect} />);
    
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('does not search for queries less than 2 characters', async () => {
    render(<SearchBar onPackageSelect={mockOnPackageSelect} />);
    
    const input = screen.getByPlaceholderText(/Search npm packages/);
    fireEvent.change(input, { target: { value: 'a' } });

    // Wait a bit to ensure debounce doesn't trigger
    await new Promise(resolve => setTimeout(resolve, 400));
    
    expect(fetch).not.toHaveBeenCalled();
  });

  test('searches for queries with 2+ characters after debounce', async () => {
    const mockResults = [
      {
        name: 'test-package',
        version: '1.0.0',
        description: 'A test package',
        keywords: ['test']
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResults)
    });

    render(<SearchBar onPackageSelect={mockOnPackageSelect} />);
    
    const input = screen.getByPlaceholderText(/Search npm packages/);
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/search/test');
    });
  });

  test('displays search results', async () => {
    const mockResults = [
      {
        name: 'test-package',
        version: '1.0.0',
        description: 'A test package',
        keywords: ['test']
      },
      {
        name: 'another-package',
        version: '2.0.0',
        description: 'Another test package',
        keywords: ['test', 'another']
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResults)
    });

    render(<SearchBar onPackageSelect={mockOnPackageSelect} />);
    
    const input = screen.getByPlaceholderText(/Search npm packages/);
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('test-package')).toBeInTheDocument();
      expect(screen.getByText('another-package')).toBeInTheDocument();
      expect(screen.getByText('A test package')).toBeInTheDocument();
      expect(screen.getByText('Another test package')).toBeInTheDocument();
    });
  });

  test('shows loading state during search', async () => {
    // Create a promise that we can control
    let resolvePromise;
    const searchPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    fetch.mockReturnValueOnce(searchPromise);

    render(<SearchBar onPackageSelect={mockOnPackageSelect} />);
    
    const input = screen.getByPlaceholderText(/Search npm packages/);
    fireEvent.change(input, { target: { value: 'test' } });

    // Wait for debounce and loading state
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    // Resolve the promise to complete the test
    resolvePromise({
      ok: true,
      json: () => Promise.resolve([])
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/search/test');
    });
  });

  test('handles search API errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    fetch.mockRejectedValueOnce(new Error('Search API Error'));

    render(<SearchBar onPackageSelect={mockOnPackageSelect} />);
    
    const input = screen.getByPlaceholderText(/Search npm packages/);
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Search error:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('shows "no packages found" when search returns empty results', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    });

    render(<SearchBar onPackageSelect={mockOnPackageSelect} />);
    
    const input = screen.getByPlaceholderText(/Search npm packages/);
    fireEvent.change(input, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('No packages found')).toBeInTheDocument();
      expect(screen.getByText('Try a different search term')).toBeInTheDocument();
    });
  });

  test('calls onPackageSelect when result is clicked', async () => {
    const mockResults = [
      {
        name: 'test-package',
        version: '1.0.0',
        description: 'A test package',
        keywords: ['test']
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResults)
    });

    render(<SearchBar onPackageSelect={mockOnPackageSelect} />);
    
    const input = screen.getByPlaceholderText(/Search npm packages/);
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('test-package')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('test-package'));

    expect(mockOnPackageSelect).toHaveBeenCalledWith('test-package', '1.0.0');
  });

  test('calls onPackageSelect when Enter is pressed', () => {
    render(<SearchBar onPackageSelect={mockOnPackageSelect} />);
    
    const input = screen.getByPlaceholderText(/Search npm packages/);
    fireEvent.change(input, { target: { value: 'test-package' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockOnPackageSelect).toHaveBeenCalledWith('test-package');
  });

  test('does not call onPackageSelect when Enter is pressed with empty query', () => {
    render(<SearchBar onPackageSelect={mockOnPackageSelect} />);
    
    const input = screen.getByPlaceholderText(/Search npm packages/);
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockOnPackageSelect).not.toHaveBeenCalled();
  });

  test('hides results when clicking outside', async () => {
    const mockResults = [
      {
        name: 'test-package',
        version: '1.0.0',
        description: 'A test package',
        keywords: ['test']
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResults)
    });

    render(<SearchBar onPackageSelect={mockOnPackageSelect} />);
    
    const input = screen.getByPlaceholderText(/Search npm packages/);
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('test-package')).toBeInTheDocument();
    });

    // Click outside
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText('test-package')).not.toBeInTheDocument();
    });
  });

  test('shows results when input is focused with existing results', async () => {
    const mockResults = [
      {
        name: 'test-package',
        version: '1.0.0',
        description: 'A test package',
        keywords: ['test']
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResults)
    });

    render(<SearchBar onPackageSelect={mockOnPackageSelect} />);
    
    const input = screen.getByPlaceholderText(/Search npm packages/);
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('test-package')).toBeInTheDocument();
    });

    // Hide results by clicking outside
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText('test-package')).not.toBeInTheDocument();
    });

    // Focus input again
    fireEvent.focus(input);

    expect(screen.getByText('test-package')).toBeInTheDocument();
  });

  test('updates input value when result is clicked', async () => {
    const mockResults = [
      {
        name: 'test-package',
        version: '1.0.0',
        description: 'A test package',
        keywords: ['test']
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResults)
    });

    render(<SearchBar onPackageSelect={mockOnPackageSelect} />);
    
    const input = screen.getByPlaceholderText(/Search npm packages/);
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('test-package')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('test-package'));

    expect(input.value).toBe('test-package');
  });

  test('handles packages without description', async () => {
    const mockResults = [
      {
        name: 'test-package',
        version: '1.0.0',
        keywords: ['test']
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResults)
    });

    render(<SearchBar onPackageSelect={mockOnPackageSelect} />);
    
    const input = screen.getByPlaceholderText(/Search npm packages/);
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('test-package')).toBeInTheDocument();
      expect(screen.getByText('No description available')).toBeInTheDocument();
    });
  });
});

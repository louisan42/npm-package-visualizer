import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Search } from 'lucide-react';

const SearchContainer = styled.div`
  max-width: 600px;
  margin: 0 auto 30px;
  position: relative;
`;

const SearchInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 16px 20px 16px 50px;
  font-size: 16px;
  border: none;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  outline: none;
  transition: box-shadow 0.3s ease;

  &:focus {
    box-shadow: 0 4px 30px rgba(0,0,0,0.15);
  }

  &::placeholder {
    color: #999;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 16px;
  color: #666;
  z-index: 1;
`;

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
`;

const SearchResultItem = styled.div`
  padding: 12px 20px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const PackageName = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const PackageDescription = styled.div`
  font-size: 14px;
  color: #666;
  line-height: 1.4;
`;

const PackageVersion = styled.span`
  font-size: 12px;
  color: #007acc;
  font-weight: 500;
`;

function SearchBar({ onPackageSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.length > 1) {
      timeoutRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/search/${encodeURIComponent(query)}`);
          if (response.ok) {
            const data = await response.json();
            setResults(data);
            setShowResults(true);
          }
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setResults([]);
      setShowResults(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleResultClick = (packageName, version) => {
    setQuery(packageName);
    setShowResults(false);
    onPackageSelect(packageName, version);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      setShowResults(false);
      onPackageSelect(query.trim());
    }
  };

  return (
    <SearchContainer ref={searchRef}>
      <SearchInputContainer>
        <SearchIcon size={20} />
        <SearchInput
          type="text"
          placeholder="Search npm packages (e.g., react, lodash, express)..."
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => results.length > 0 && setShowResults(true)}
        />
      </SearchInputContainer>

      {showResults && (
        <SearchResults>
          {loading ? (
            <SearchResultItem>
              <PackageName>Searching...</PackageName>
            </SearchResultItem>
          ) : results.length > 0 ? (
            results.map((pkg, index) => (
              <SearchResultItem
                key={index}
                onClick={() => handleResultClick(pkg.name, pkg.version)}
              >
                <PackageName>
                  {pkg.name} <PackageVersion>v{pkg.version}</PackageVersion>
                </PackageName>
                <PackageDescription>
                  {pkg.description || 'No description available'}
                </PackageDescription>
              </SearchResultItem>
            ))
          ) : query.length > 1 ? (
            <SearchResultItem>
              <PackageName>No packages found</PackageName>
              <PackageDescription>Try a different search term</PackageDescription>
            </SearchResultItem>
          ) : null}
        </SearchResults>
      )}
    </SearchContainer>
  );
}

export default SearchBar;

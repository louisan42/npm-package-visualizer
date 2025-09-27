import React, { useState } from 'react';
import styled from 'styled-components';
import SearchBar from './components/SearchBar';
import DependencyTree from './components/DependencyTree';
import PackageInfo from './components/PackageInfo';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import './App.css';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: white;
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
`;

const Subtitle = styled.p`
  color: rgba(255,255,255,0.8);
  font-size: 1.1rem;
  margin: 0;
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LeftPanel = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  height: fit-content;
`;

const RightPanel = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  min-height: 600px;
`;

function App() {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [dependencyTree, setDependencyTree] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePackageSelect = async (packageName, version = 'latest') => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch package info
      const packageResponse = await fetch(`/api/package/${packageName}?version=${version}`);
      if (!packageResponse.ok) {
        throw new Error('Package not found');
      }
      const packageData = await packageResponse.json();
      setSelectedPackage(packageData);

      // Fetch dependency tree
      const treeResponse = await fetch(`/api/dependencies/${packageName}?version=${version}&depth=3`);
      if (!treeResponse.ok) {
        throw new Error('Failed to fetch dependencies');
      }
      const treeData = await treeResponse.json();
      setDependencyTree(treeData);
      
    } catch (err) {
      setError(err.message);
      setSelectedPackage(null);
      setDependencyTree(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContainer>
      <Header>
        <Title>📦 NPM Package Visualizer</Title>
        <Subtitle>
          Explore npm package dependencies, security vulnerabilities, and compatibility
        </Subtitle>
      </Header>

      <SearchBar onPackageSelect={handlePackageSelect} />

      {error && <ErrorMessage message={error} />}

      <MainContent>
        <LeftPanel>
          {loading ? (
            <LoadingSpinner />
          ) : selectedPackage ? (
            <PackageInfo package={selectedPackage} dependencyTree={dependencyTree} />
          ) : (
            <div style={{ textAlign: 'center', color: '#666', padding: '40px 20px' }}>
              <h3>Search for an npm package to get started</h3>
              <p>Enter a package name above to visualize its dependency tree and security information.</p>
            </div>
          )}
        </LeftPanel>

        <RightPanel>
          {loading ? (
            <LoadingSpinner />
          ) : dependencyTree ? (
            <DependencyTree 
              data={dependencyTree} 
              onNodeClick={handlePackageSelect}
            />
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: '#666',
              textAlign: 'center'
            }}>
              <div>
                <h3>Dependency Tree Visualization</h3>
                <p>Select a package to see its interactive dependency tree</p>
              </div>
            </div>
          )}
        </RightPanel>
      </MainContent>
    </AppContainer>
  );
}

export default App;

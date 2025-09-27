import React, { useState } from 'react';
import styled from 'styled-components';
import SearchBar from './components/SearchBar';
import DependencyTree from './components/DependencyTree';
import PackageInfo from './components/PackageInfo';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { Container, Panel, Title, Subtitle, Grid } from './components/shared/StyledComponents';
import { colors, breakpoints } from './theme/constants';
import { getEmptyStateText } from './utils/helpers';
import './App.css';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientEnd} 100%);
  padding: 20px;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 30px;
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${colors.muted};
  text-align: center;
  padding: 40px 20px;
  
  @media (max-width: ${breakpoints.mobile}) {
    padding: 20px 10px;
  }
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

  const searchEmptyState = getEmptyStateText('search');
  const dependenciesEmptyState = getEmptyStateText('dependencies');

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

      <Container>
        <Grid columns="1fr 2fr">
          <Panel height="fit-content">
            {loading ? (
              <LoadingSpinner />
            ) : selectedPackage ? (
              <PackageInfo package={selectedPackage} dependencyTree={dependencyTree} />
            ) : (
              <EmptyState>
                <div>
                  <h3>{searchEmptyState.title}</h3>
                  <p>{searchEmptyState.description}</p>
                </div>
              </EmptyState>
            )}
          </Panel>

          <Panel minHeight="600px">
            {loading ? (
              <LoadingSpinner />
            ) : dependencyTree ? (
              <DependencyTree 
                data={dependencyTree} 
                onNodeClick={handlePackageSelect}
              />
            ) : (
              <EmptyState>
                <div>
                  <h3>{dependenciesEmptyState.title}</h3>
                  <p>{dependenciesEmptyState.description}</p>
                </div>
              </EmptyState>
            )}
          </Panel>
        </Grid>
      </Container>
    </AppContainer>
  );
}

export default App;

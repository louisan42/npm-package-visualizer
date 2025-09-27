import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { findDependencyInTree, checkVersionSatisfies } from '../utils/helpers';

const MatrixContainer = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const MatrixTitle = styled.h4`
  margin: 0 0 16px 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CompatibilityGrid = styled.div`
  display: grid;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
`;

const CompatibilityItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  border-left: 4px solid ${props => {
    switch (props.status) {
      case 'compatible': return '#28a745';
      case 'incompatible': return '#dc3545';
      case 'warning': return '#ffc107';
      default: return '#6c757d';
    }
  }};
`;

const DependencyInfo = styled.div`
  flex: 1;
`;

const DependencyName = styled.div`
  font-weight: 500;
  color: #333;
  font-size: 14px;
`;

const VersionInfo = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 2px;
`;

const StatusIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${props => {
    switch (props.status) {
      case 'compatible': return '#28a745';
      case 'incompatible': return '#dc3545';
      case 'warning': return '#ffc107';
      default: return '#6c757d';
    }
  }};
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

function CompatibilityMatrix({ packageData, dependencyTree }) {
  const [compatibilityData, setCompatibilityData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Simple compatibility analysis function
  const analyzeDependencyCompatibility = useCallback((depName, requiredVersion, installedVersion) => {
    const isCompatible = checkVersionSatisfies(installedVersion, requiredVersion);
    return {
      name: depName,
      required: requiredVersion,
      installed: installedVersion,
      status: isCompatible ? 'compatible' : 'incompatible',
      message: isCompatible 
        ? `Version ${installedVersion} satisfies ${requiredVersion}`
        : `Version ${installedVersion} does not satisfy ${requiredVersion}`
    };
  }, []);

  const analyzeCompatibility = useCallback(async () => {
    setLoading(true);
    
    try {
      const compatibility = [];
      
      // Analyze direct dependencies
      const dependencies = packageData.dependencies || {};
      
      for (const [depName, requiredVersion] of Object.entries(dependencies)) {
        // Find this dependency in the tree
        const depNode = findDependencyInTree(dependencyTree, depName);
        
        if (depNode) {
          const analysis = analyzeDependencyCompatibility(
            depName, 
            requiredVersion, 
            depNode.version
          );
          compatibility.push(analysis);
        }
      }
      
      setCompatibilityData(compatibility);
    } catch (error) {
      console.error('Error analyzing compatibility:', error);
    } finally {
      setLoading(false);
    }
  }, [packageData, dependencyTree, analyzeDependencyCompatibility]);

  useEffect(() => {
    if (packageData && dependencyTree) {
      analyzeCompatibility();
    }
  }, [packageData, dependencyTree, analyzeCompatibility]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compatible':
        return <CheckCircle size={16} />;
      case 'incompatible':
        return <XCircle size={16} />;
      case 'warning':
        return <AlertCircle size={16} />;
      default:
        return <Info size={16} />;
    }
  };

  if (!packageData || !dependencyTree) {
    return null;
  }

  return (
    <MatrixContainer>
      <MatrixTitle>
        <Info size={16} />
        Compatibility Matrix
      </MatrixTitle>
      
      {loading ? (
        <LoadingMessage>Analyzing compatibility...</LoadingMessage>
      ) : compatibilityData.length > 0 ? (
        <CompatibilityGrid>
          {compatibilityData.map((item, index) => (
            <CompatibilityItem key={index} status={item.status}>
              <DependencyInfo>
                <DependencyName>{item.name}</DependencyName>
                <VersionInfo>
                  Required: {item.required} | Installed: {item.installed}
                </VersionInfo>
              </DependencyInfo>
              <StatusIcon status={item.status}>
                {getStatusIcon(item.status)}
                {item.message}
              </StatusIcon>
            </CompatibilityItem>
          ))}
        </CompatibilityGrid>
      ) : (
        <LoadingMessage>No dependencies to analyze</LoadingMessage>
      )}
    </MatrixContainer>
  );
}

export default CompatibilityMatrix;

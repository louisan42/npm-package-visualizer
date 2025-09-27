import React from 'react';
import styled from 'styled-components';
import { ExternalLink, Users, Tag, GitBranch } from 'lucide-react';
import CompatibilityMatrix from './CompatibilityMatrix';

const InfoContainer = styled.div`
  padding: 0;
`;

const PackageHeader = styled.div`
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
`;

const PackageName = styled.h2`
  color: #333;
  margin-bottom: 8px;
  font-size: 1.5rem;
`;

const PackageVersion = styled.div`
  color: #007acc;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 10px;
`;

const PackageDescription = styled.p`
  color: #666;
  line-height: 1.5;
  margin-bottom: 15px;
`;

const InfoSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  color: #333;
  font-size: 1rem;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 10px;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 14px;
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: #555;
`;

const InfoValue = styled.span`
  color: #333;
  text-align: right;
  flex: 1;
  margin-left: 10px;
`;

const LinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  background: #007acc;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 12px;
  transition: background-color 0.2s ease;

  &:hover {
    background: #005a9e;
  }
`;

const KeywordTag = styled.span`
  display: inline-block;
  background: #e9ecef;
  color: #495057;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin: 2px;
`;

const KeywordsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
`;

const DependencyCount = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 10px;
`;

const CountItem = styled.div`
  text-align: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
`;

const CountNumber = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #007acc;
`;

const CountLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

function PackageInfo({ package: pkg, dependencyTree }) {
  if (!pkg) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const getRepositoryUrl = (repo) => {
    if (!repo) return null;
    if (typeof repo === 'string') return repo;
    if (repo.url) {
      return repo.url.replace(/^git\+/, '').replace(/\.git$/, '');
    }
    return null;
  };

  const dependencyCount = Object.keys(pkg.dependencies || {}).length;
  const devDependencyCount = Object.keys(pkg.devDependencies || {}).length;
  const peerDependencyCount = Object.keys(pkg.peerDependencies || {}).length;

  return (
    <InfoContainer>
      <PackageHeader>
        <PackageName>{pkg.name}</PackageName>
        <PackageVersion>v{pkg.version}</PackageVersion>
        {pkg.description && (
          <PackageDescription>{pkg.description}</PackageDescription>
        )}
      </PackageHeader>

      <InfoSection>
        <SectionTitle>
          <Tag size={16} />
          Package Details
        </SectionTitle>
        <InfoGrid>
          <InfoItem>
            <InfoLabel>License</InfoLabel>
            <InfoValue>{pkg.license || 'Not specified'}</InfoValue>
          </InfoItem>
          
          {pkg.time && pkg.time[pkg.version] && (
            <InfoItem>
              <InfoLabel>Published</InfoLabel>
              <InfoValue>{formatDate(pkg.time[pkg.version])}</InfoValue>
            </InfoItem>
          )}

          {pkg.versions && (
            <InfoItem>
              <InfoLabel>Total Versions</InfoLabel>
              <InfoValue>{pkg.versions.length}</InfoValue>
            </InfoItem>
          )}
        </InfoGrid>
      </InfoSection>

      <InfoSection>
        <SectionTitle>
          <GitBranch size={16} />
          Dependencies
        </SectionTitle>
        <DependencyCount>
          <CountItem>
            <CountNumber>{dependencyCount}</CountNumber>
            <CountLabel>Dependencies</CountLabel>
          </CountItem>
          <CountItem>
            <CountNumber>{devDependencyCount}</CountNumber>
            <CountLabel>Dev Dependencies</CountLabel>
          </CountItem>
        </DependencyCount>
        {peerDependencyCount > 0 && (
          <InfoItem style={{ marginTop: '10px' }}>
            <InfoLabel>Peer Dependencies</InfoLabel>
            <InfoValue>{peerDependencyCount}</InfoValue>
          </InfoItem>
        )}
      </InfoSection>

      {pkg.maintainers && pkg.maintainers.length > 0 && (
        <InfoSection>
          <SectionTitle>
            <Users size={16} />
            Maintainers
          </SectionTitle>
          <InfoItem>
            <InfoLabel>Count</InfoLabel>
            <InfoValue>{pkg.maintainers.length}</InfoValue>
          </InfoItem>
        </InfoSection>
      )}

      {pkg.keywords && pkg.keywords.length > 0 && (
        <InfoSection>
          <SectionTitle>
            <Tag size={16} />
            Keywords
          </SectionTitle>
          <KeywordsContainer>
            {pkg.keywords.slice(0, 10).map((keyword, index) => (
              <KeywordTag key={index}>{keyword}</KeywordTag>
            ))}
            {pkg.keywords.length > 10 && (
              <KeywordTag>+{pkg.keywords.length - 10} more</KeywordTag>
            )}
          </KeywordsContainer>
        </InfoSection>
      )}

      <InfoSection>
        <SectionTitle>
          <ExternalLink size={16} />
          Links
        </SectionTitle>
        <InfoGrid>
          <InfoItem>
            <LinkButton 
              href={`https://www.npmjs.com/package/${pkg.name}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={12} />
              NPM Registry
            </LinkButton>
          </InfoItem>
          
          {getRepositoryUrl(pkg.repository) && (
            <InfoItem>
              <LinkButton 
                href={getRepositoryUrl(pkg.repository)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={12} />
                Repository
              </LinkButton>
            </InfoItem>
          )}

          {pkg.homepage && (
            <InfoItem>
              <LinkButton 
                href={pkg.homepage}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={12} />
                Homepage
              </LinkButton>
            </InfoItem>
          )}
        </InfoGrid>
      </InfoSection>

      {/* Compatibility Matrix */}
      <CompatibilityMatrix packageData={pkg} dependencyTree={dependencyTree} />
    </InfoContainer>
  );
}

export default PackageInfo;

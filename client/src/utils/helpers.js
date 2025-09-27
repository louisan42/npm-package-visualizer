import { colors } from '../theme/constants';

/**
 * Format a date string to a localized date
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Get repository URL from various repository formats
 * @param {string|object} repo - Repository information
 * @returns {string|null} Clean repository URL
 */
export const getRepositoryUrl = (repo) => {
  if (!repo) return null;
  if (typeof repo === 'string') return repo;
  if (repo.url) {
    return repo.url.replace(/^git\+/, '').replace(/\.git$/, '');
  }
  return null;
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 15) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

/**
 * Get color based on vulnerability severity
 * @param {object} severityCounts - Object with severity counts
 * @param {number} vulnerabilityCount - Total vulnerability count
 * @returns {string} Color hex code
 */
export const getVulnerabilityColor = (severityCounts = {}, vulnerabilityCount = 0) => {
  if (vulnerabilityCount === 0) return colors.success;
  
  if (severityCounts.critical > 0) return colors.critical;
  if (severityCounts.high > 0) return colors.high;
  if (severityCounts.moderate > 0 || severityCounts.medium > 0) return colors.moderate;
  if (severityCounts.low > 0) return colors.low;
  
  return colors.unknown;
};

/**
 * Get status color for compatibility
 * @param {string} status - Compatibility status
 * @returns {string} Color hex code
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'compatible': return colors.compatible;
    case 'incompatible': return colors.incompatible;
    case 'warning': return colors.warning;
    default: return colors.unknown;
  }
};

/**
 * Check if a version satisfies a requirement
 * @param {string} installed - Installed version
 * @param {string} required - Required version range
 * @returns {boolean} Whether version satisfies requirement
 */
export const checkVersionSatisfies = (installed, required) => {
  try {
    if (required.startsWith('^')) {
      const baseVersion = required.slice(1);
      return installed >= baseVersion;
    }
    if (required.startsWith('~')) {
      const baseVersion = required.slice(1);
      return installed.startsWith(baseVersion.split('.')[0]);
    }
    return installed === required;
  } catch (error) {
    return false;
  }
};

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Generate tooltip content for dependency nodes
 * @param {object} nodeData - Node data object
 * @returns {string} HTML tooltip content
 */
export const generateTooltipContent = (nodeData) => {
  const securityInfo = nodeData.vulnerability_count > 0 
    ? `<br/><span style="color: ${colors.danger};">🚨 ${nodeData.vulnerability_count} vulnerabilities</span>
       ${nodeData.severity_counts ? Object.entries(nodeData.severity_counts)
         .map(([severity, count]) => `<br/>&nbsp;&nbsp;${severity}: ${count}`)
         .join('') : ''}`
    : `<br/><span style="color: ${colors.success};">✅ No known vulnerabilities</span>`;
  
  return `
    <strong>${nodeData.name}</strong><br/>
    Version: ${nodeData.version || 'unknown'}<br/>
    ${nodeData.description ? `Description: ${nodeData.description.substring(0, 100)}...` : ''}
    ${nodeData.license ? `<br/>License: ${nodeData.license}` : ''}
    ${securityInfo}
    ${nodeData.security_score !== undefined ? `<br/>Security Score: ${nodeData.security_score}/100` : ''}
    ${nodeData.error ? `<br/><span style="color: ${colors.danger};">Error: ${nodeData.error}</span>` : ''}
    ${nodeData.circular ? `<br/><span style="color: ${colors.warning};">Circular dependency</span>` : ''}
  `;
};

/**
 * Find a dependency in a tree structure
 * @param {object} tree - Dependency tree
 * @param {string} depName - Dependency name to find
 * @returns {object|null} Found dependency node or null
 */
export const findDependencyInTree = (tree, depName) => {
  if (tree.name === depName) return tree;
  
  for (const dep of tree.dependencies || []) {
    const found = findDependencyInTree(dep, depName);
    if (found) return found;
  }
  
  return null;
};

/**
 * Calculate node size based on depth
 * @param {number} depth - Node depth in tree
 * @param {number} baseSize - Base size for root node
 * @param {number} minSize - Minimum size for deep nodes
 * @returns {number} Calculated node size
 */
export const calculateNodeSize = (depth, baseSize = 20, minSize = 8) => {
  return Math.max(minSize, baseSize - depth * 2);
};

/**
 * Calculate font size based on depth
 * @param {number} depth - Node depth in tree
 * @param {number} baseSize - Base font size
 * @param {number} minSize - Minimum font size
 * @returns {number} Calculated font size
 */
export const calculateFontSize = (depth, baseSize = 14, minSize = 10) => {
  return Math.max(minSize, baseSize - depth);
};

/**
 * Validate package name format
 * @param {string} packageName - Package name to validate
 * @returns {boolean} Whether package name is valid
 */
export const isValidPackageName = (packageName) => {
  if (!packageName || typeof packageName !== 'string') return false;
  // Basic npm package name validation
  return /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(packageName);
};

/**
 * Get display text for empty states
 * @param {string} type - Type of empty state
 * @returns {object} Title and description for empty state
 */
export const getEmptyStateText = (type) => {
  const emptyStates = {
    search: {
      title: 'Search for an npm package to get started',
      description: 'Enter a package name above to visualize its dependency tree and security information.'
    },
    dependencies: {
      title: 'Dependency Tree Visualization',
      description: 'Select a package to see its interactive dependency tree'
    },
    noResults: {
      title: 'No packages found',
      description: 'Try a different search term'
    },
    error: {
      title: 'Something went wrong',
      description: 'Please try again or contact support if the problem persists'
    }
  };
  
  return emptyStates[type] || emptyStates.error;
};

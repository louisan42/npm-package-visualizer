// Theme constants to reduce duplication across components
export const colors = {
  primary: '#007acc',
  primaryDark: '#005a9e',
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#333',
  muted: '#666',
  border: '#f0f0f0',
  background: '#fafafa',
  white: '#ffffff',
  
  // Semantic colors
  compatible: '#28a745',
  incompatible: '#dc3545',
  outdated: '#ffc107',
  unknown: '#6c757d',
  
  // Vulnerability severity colors
  critical: '#dc3545',
  high: '#fd7e14',
  moderate: '#ffc107',
  medium: '#ffc107',
  low: '#17a2b8',
  
  // Gradient
  gradientStart: '#667eea',
  gradientEnd: '#764ba2'
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
  xxxl: '30px'
};

export const borderRadius = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px'
};

export const shadows = {
  light: '0 4px 20px rgba(0,0,0,0.1)',
  medium: '0 8px 32px rgba(0,0,0,0.1)',
  heavy: '0 4px 30px rgba(0,0,0,0.15)'
};

export const typography = {
  fontSizes: {
    xs: '10px',
    sm: '12px',
    md: '14px',
    lg: '16px',
    xl: '1.1rem',
    xxl: '1.5rem',
    xxxl: '2.5rem'
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
};

export const breakpoints = {
  mobile: '768px'
};

export const zIndex = {
  tooltip: 1000,
  dropdown: 1000,
  modal: 1001
};

// API constants
export const API_ENDPOINTS = {
  PACKAGE: '/api/package',
  DEPENDENCIES: '/api/dependencies',
  SEARCH: '/api/search',
  VULNERABILITIES: '/api/vulnerabilities',
  HEALTH: '/api/health'
};

// App constants
export const APP_CONSTANTS = {
  DEFAULT_TREE_DEPTH: 3,
  SEARCH_DEBOUNCE_MS: 300,
  CACHE_TTL_MS: 600000, // 10 minutes
  MAX_SEARCH_RESULTS: 20,
  MAX_KEYWORDS_DISPLAY: 10,
  MIN_SEARCH_LENGTH: 2
};

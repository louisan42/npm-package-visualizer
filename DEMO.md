# 🚀 NPM Package Visualizer - Demo Guide

## Quick Start

1. **Start the application**:
   ```bash
   npm run dev
   ```
   This starts both the backend (port 3001) and frontend (port 3000) servers.

2. **Open your browser** and navigate to `http://localhost:3000`

## Demo Walkthrough

### 1. Search for Packages
- Try searching for popular packages like: `react`, `express`, `lodash`, `axios`
- The search provides autocomplete suggestions with descriptions
- Click on any result or press Enter to analyze the package

### 2. Explore the Dependency Tree
- **Interactive Visualization**: The right panel shows an interactive D3.js tree
- **Color Coding**: 
  - 🔵 Blue: Root package
  - 🟢 Green: Safe dependencies (no vulnerabilities)
  - 🟡 Yellow: Low/Medium severity vulnerabilities
  - 🟠 Orange: High severity vulnerabilities  
  - 🔴 Red: Critical vulnerabilities or errors
- **Hover Effects**: Hover over nodes to see detailed information
- **Click to Drill Down**: Click any node to analyze that package

### 3. Package Information Panel
- **Metadata**: Version, license, description, maintainers
- **Dependencies Count**: Visual breakdown of dependency types
- **Links**: Direct links to npm registry, repository, homepage
- **Keywords**: Package tags and categories

### 4. Security Analysis
- **Vulnerability Detection**: Real-time CVE checking
- **Security Score**: 0-100 score based on vulnerabilities
- **Severity Breakdown**: Critical, High, Medium, Low counts
- **Multiple Sources**: GitHub Advisory Database + npm audit

### 5. Compatibility Matrix
- **Version Conflicts**: Shows mismatched dependency versions
- **Outdated Packages**: Highlights packages behind latest versions
- **Compatibility Status**: Visual indicators for each dependency

## Example Packages to Try

### Safe Packages (Good Examples)
- `lodash` - Utility library with no dependencies
- `chalk` - Terminal styling with minimal dependencies
- `uuid` - Simple UUID generator

### Complex Dependencies
- `express` - Web framework with many dependencies
- `react` - UI library with peer dependencies
- `webpack` - Build tool with extensive dependency tree

### Packages with Vulnerabilities (Educational)
- Try older versions of packages to see vulnerability warnings
- Search for packages known to have security issues

## Features Demonstrated

✅ **Interactive Dependency Tree Visualization**
✅ **Real-time Security Vulnerability Analysis** 
✅ **Package Compatibility Matrix**
✅ **Smart Search with Autocomplete**
✅ **Detailed Package Metadata**
✅ **Responsive Design**
✅ **Error Handling and Loading States**
✅ **Drill-down Navigation**

## API Endpoints Available

- `GET /api/health` - Health check
- `GET /api/search/:query` - Search packages
- `GET /api/package/:name` - Get package info
- `GET /api/dependencies/:name` - Get dependency tree
- `GET /api/vulnerabilities/:name` - Get security info

## Performance Features

- **Caching**: 10-minute cache for API responses
- **Lazy Loading**: Dependencies loaded on-demand
- **Depth Limiting**: Configurable tree depth (default: 3 levels)
- **Error Recovery**: Graceful handling of missing packages

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (responsive design)

## Troubleshooting

### Common Issues
1. **Port conflicts**: Change ports in package.json if needed
2. **API rate limits**: npm registry may rate limit requests
3. **Large packages**: Some packages may take time to analyze

### Performance Tips
- Use smaller depth values for large packages
- Clear browser cache if experiencing issues
- Check network connection for API calls

---

**Built with**: React, D3.js, Node.js, Express, npm Registry API, GitHub Advisory Database

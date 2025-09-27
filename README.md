# 🔍 NPM Package Visualizer

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![CI/CD Pipeline](https://github.com/louisan42/npm-package-visualizer/actions/workflows/ci.yml/badge.svg)](https://github.com/louisan42/npm-package-visualizer/actions)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](CONTRIBUTING.md)

Interactive dependency tree visualization tool with security analysis for npm packages.

## Features

- 🔍 **Smart Package Search**: Search and discover npm packages with autocomplete
- 🌳 **Interactive Dependency Tree**: Visualize package dependencies with D3.js
- 📊 **Compatibility Matrix**: Version compatibility checking
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Fast Performance**: Caching and optimized API calls

## Tech Stack

- **Frontend**: React, D3.js, Styled Components
- **Backend**: Node.js, Express
- **APIs**: NPM Registry API, Security databases
- **Visualization**: D3.js for interactive tree diagrams

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone and setup the project**:
   ```bash
   git clone <your-repo-url>
   cd npm-package-visualizer
   ```

2. **Install dependencies**:
   ```bash
   npm run install-all
   ```

3. **Start the development servers**:
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:3001`
   - Frontend development server on `http://localhost:3000`

4. **Open your browser** and navigate to `http://localhost:3000`

## Usage

1. **Search for a package**: Type an npm package name in the search bar
2. **Select a package**: Click on a search result or press Enter
3. **Explore dependencies**: View the interactive dependency tree
4. **Click nodes**: Click on any node in the tree to explore that package
5. **View details**: Check package information, security status, and metadata

## API Endpoints

- `GET /api/package/:name` - Get package information
- `GET /api/dependencies/:name` - Get dependency tree
- `GET /api/search/:query` - Search packages
- `GET /api/vulnerabilities/:name` - Get security information
- `GET /api/health` - Health check

## Project Structure

```
npm-package-visualizer/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   └── public/            # Static assets
├── server/                # Node.js backend
│   └── index.js          # Express server
├── package.json          # Root dependencies
└── README.md            # This file
```

## Development

### Backend Development

The backend server provides REST APIs to fetch npm package data:

- Fetches package metadata from npm registry
- Builds dependency trees recursively
- Caches responses for performance
- Provides search functionality

### Frontend Development

The frontend is a React application with:

- **SearchBar**: Autocomplete package search
- **DependencyTree**: D3.js visualization component
- **PackageInfo**: Package details and metadata
- **Responsive design** with styled-components

### Adding Features

1. **Security Integration**: Enhance vulnerability checking with real CVE databases
2. **Compatibility Matrix**: Add detailed version compatibility analysis
3. **Export Features**: Add ability to export dependency trees
4. **Performance**: Add more caching and optimization

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3001
NODE_ENV=development
CACHE_TTL=600
```

### Customization

- **Tree Depth**: Modify `maxDepth` in API calls to control dependency depth
- **Cache Duration**: Adjust `stdTTL` in server configuration
- **Styling**: Modify styled-components in React components

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Roadmap

- [ ] Enhanced security vulnerability database integration
- [ ] Package comparison features
- [ ] Export functionality (JSON, SVG, PNG)
- [ ] Advanced filtering and search options
- [ ] Package popularity and download statistics
- [ ] Integration with GitHub for repository information
- [ ] Docker containerization
- [ ] Performance optimizations and caching improvements

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'feat: add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/louisan42/npm-package-visualizer/issues) page
2. Create a new issue with detailed information
3. Provide steps to reproduce any bugs

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for the npm community

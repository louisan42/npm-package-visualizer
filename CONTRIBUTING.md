# Contributing to NPM Package Visualizer

Thank you for your interest in contributing to the NPM Package Visualizer! 🎉

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or 20.x
- npm (comes with Node.js)
- Git

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/npm-package-visualizer.git
   cd npm-package-visualizer
   ```

3. **Install dependencies**:
   ```bash
   npm run install-all
   ```

4. **Start development servers**:
   ```bash
   npm run dev
   ```

5. **Run tests**:
   ```bash
   npm test
   ```

## 🛠️ Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - New features
- `bugfix/issue-description` - Bug fixes
- `hotfix/critical-fix` - Critical production fixes

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Write/update tests** for your changes

4. **Run the test suite**:
   ```bash
   npm run test:coverage
   npm run lint
   ```

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

### Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: add package comparison feature
fix: resolve dependency tree infinite loop
docs: update API documentation
test: add unit tests for security service
```

## 🧪 Testing Guidelines

### Test Requirements

- **Unit Tests**: All new functions/methods must have unit tests
- **Integration Tests**: API endpoints and workflows need integration tests
- **Coverage**: Maintain 80% code coverage minimum
- **Linting**: Code must pass ESLint checks

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📋 Pull Request Process

### Before Submitting

- [ ] Tests pass locally (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code coverage meets requirements
- [ ] Documentation is updated (if needed)
- [ ] CHANGELOG.md is updated (for significant changes)

### PR Guidelines

1. **Create a descriptive title**:
   - ✅ "Add package comparison feature with side-by-side view"
   - ❌ "Update stuff"

2. **Fill out the PR template** (auto-generated)

3. **Link related issues**: Use "Fixes #123" or "Closes #456"

4. **Add screenshots/demos** for UI changes

5. **Request review** from maintainers

### PR Review Process

- All PRs require at least one approval
- CI/CD pipeline must pass (tests, linting, security scans)
- SonarQube quality gate must pass
- No merge conflicts

## 🎯 Areas for Contribution

### High Priority

- [ ] Enhanced security vulnerability database integration
- [ ] Package comparison features
- [ ] Export functionality (JSON, SVG, PNG)
- [ ] Advanced filtering and search options

### Medium Priority

- [ ] Package popularity and download statistics
- [ ] Integration with GitHub for repository information
- [ ] Performance optimizations and caching improvements
- [ ] Mobile responsiveness improvements

### Good First Issues

- [ ] UI/UX improvements
- [ ] Documentation enhancements
- [ ] Additional test coverage
- [ ] Bug fixes and error handling
- [ ] Accessibility improvements

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Try the latest version** to see if it's already fixed
3. **Check the documentation** for expected behavior

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Node.js version: [e.g. 18.17.0]
- npm version: [e.g. 9.6.7]

**Additional context**
Any other context about the problem.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context, mockups, or examples.
```

## 📚 Code Style Guidelines

### JavaScript/Node.js

- Use **ES6+** features where appropriate
- Follow **ESLint** configuration (`.eslintrc.js`)
- Use **meaningful variable names**
- Add **JSDoc comments** for functions
- Prefer **async/await** over promises
- Use **const/let** instead of var

### React/Frontend

- Use **functional components** with hooks
- Follow **React best practices**
- Use **styled-components** for styling
- Implement **proper error boundaries**
- Add **PropTypes** or TypeScript types

### Testing

- Use **descriptive test names**
- Follow **AAA pattern** (Arrange, Act, Assert)
- **Mock external dependencies**
- Test **both success and error cases**
- Use **beforeEach/afterEach** for setup/cleanup

## 🔒 Security

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Instead, email: [your-email@example.com]

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Security Guidelines

- Never commit secrets, API keys, or passwords
- Use environment variables for configuration
- Validate all user inputs
- Follow OWASP security practices
- Keep dependencies updated

## 📞 Getting Help

### Community Support

- **GitHub Discussions**: For questions and general discussion
- **Issues**: For bug reports and feature requests
- **Discord/Slack**: [Add community links if available]

### Maintainer Contact

- **Louis Amoah-Nuamah**: [@louisan42](https://github.com/louisan42)

## 📄 License

By contributing to NPM Package Visualizer, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to NPM Package Visualizer! 🚀

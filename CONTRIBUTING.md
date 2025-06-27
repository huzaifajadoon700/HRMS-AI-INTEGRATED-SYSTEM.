# Contributing to HRMS AI Integrated System

Thank you for your interest in contributing to the HRMS AI Integrated System! We welcome contributions from developers of all skill levels.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git
- Basic knowledge of JavaScript, React, and Node.js

### Development Setup

1. **Fork the repository**
   ```bash
   git fork <repository-url>
   ```

2. **Clone your fork**
   ```bash
   git clone <your-fork-url>
   cd "HRMS AI INTEGRATEDSYSTEM"
   ```

3. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   - Create `.env` files in both `backend` and `frontend` directories
   - Add necessary configuration (database, API keys, etc.)

5. **Start development servers**
   ```bash
   # Backend (in backend directory)
   npm run dev
   
   # Frontend (in frontend directory)
   npm start
   ```

## 📝 How to Contribute

### 1. Choose an Issue
- Check the [Issues](../../issues) page for open tasks
- Look for issues labeled `good first issue` for beginners
- Comment on the issue to let others know you're working on it

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Make Your Changes
- Write clean, readable code
- Follow existing code style and conventions
- Add comments for complex logic
- Update documentation if needed

### 4. Test Your Changes
- Test your changes thoroughly
- Ensure existing functionality still works
- Add new tests if applicable

### 5. Commit Your Changes
```bash
git add .
git commit -m "feat: add new feature description"
# or
git commit -m "fix: resolve specific bug"
```

### 6. Push and Create Pull Request
```bash
git push origin your-branch-name
```
Then create a Pull Request on GitHub.

## 🎯 Contribution Guidelines

### Code Style
- Use consistent indentation (2 spaces)
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Follow existing naming conventions

### Commit Messages
Use conventional commit format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

### Pull Request Guidelines
- Provide a clear description of changes
- Reference related issues
- Include screenshots for UI changes
- Ensure all tests pass
- Keep PRs focused and atomic

## 🐛 Reporting Bugs

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, Node.js version)

## 💡 Suggesting Features

For feature requests:
- Check if the feature already exists
- Provide clear use case and benefits
- Include mockups or examples if helpful
- Discuss implementation approach

## 📚 Areas for Contribution

- **Frontend**: React components, UI/UX improvements
- **Backend**: API endpoints, database optimization
- **AI/ML**: Recommendation algorithms, data analysis
- **Testing**: Unit tests, integration tests
- **Documentation**: Code comments, user guides
- **Performance**: Optimization, caching strategies

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Focus on the project's goals

## 📞 Getting Help

- Join our discussions in Issues
- Ask questions in Pull Requests
- Reach out to maintainers for guidance

## 🎉 Recognition

Contributors will be:
- Listed in the project's contributors
- Mentioned in release notes for significant contributions
- Invited to join the core team for outstanding contributions

Thank you for contributing to HRMS AI Integrated System! 🚀

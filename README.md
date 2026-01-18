# Nx Monorepo

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ A production-ready monorepo with React (Vite) frontend and Express API backend ✨

## 📦 Project Overview

This repository demonstrates a production-ready React monorepo with:

- **2 Applications**

  - `web-app` - React web application built with Vite
  - `api` - Express backend API

## 🚀 Quick Start

```bash
# Clone the repository
git clone <your-fork-url>
cd <your-repository-name>

# Install dependencies
npm install

# Serve the React web application
npx nx serve web-app

# ...or you can serve the API separately
npx nx serve api

# Build all projects
npx nx run-many -t build

# Run tests
npx nx run-many -t test

# Lint all projects
npx nx run-many -t lint

# Run tasks in parallel
npx nx run-many -t lint test build --parallel=3

# Visualize the project graph
npx nx graph
```

## ⭐ Featured Nx Capabilities

This repository showcases several powerful Nx features:

### 1. ⚡ Fast Development with Vite

The web application uses Vite for lightning-fast development and hot module replacement:

```bash
# Start the development server
npx nx serve web-app

# Build for production
npx nx build web-app
```

[Learn more about Vite with React →](https://nx.dev/recipes/vite)

### 2. 🧪 Testing with Vitest and Jest

- **Vitest** for React web application testing
- **Jest** for Express API testing

```bash
# Test the web application
npx nx test web-app

# Test the API
npx nx test api

# Test all projects
npx nx run-many -t test
```

[Learn more about Vite testing →](https://nx.dev/recipes/vite)

### 3. 🚀 Express API with TypeScript

The API is built with Express and TypeScript, using esbuild for fast builds:

```bash
# Start the API server
npx nx serve api

# Build the API
npx nx build api
```

### 4. 🔧 Self-Healing CI

The CI pipeline includes `nx fix-ci` which automatically identifies and suggests fixes for common issues:

```bash
# In CI, this command provides automated fixes
npx nx fix-ci
```

This feature helps maintain a healthy CI pipeline by automatically detecting and suggesting solutions for:

- Missing dependencies
- Incorrect task configurations
- Cache invalidation issues
- Common build failures

[Learn more about self-healing CI →](https://nx.dev/ci/features/self-healing-ci)

## 📁 Project Structure

```
├── packages/
│   ├── web-app/        - React web application (Vite)
│   └── api/            - Express backend API
├── nx.json             - Nx configuration
├── tsconfig.json       - TypeScript configuration
└── eslint.config.mjs   - ESLint configuration
```

## 📚 Useful Commands

```bash
# Project exploration
npx nx graph                                    # Interactive dependency graph
npx nx list                                     # List installed plugins
npx nx show project web-app --web              # View web-app project details
npx nx show project api --web                  # View api project details

# Development
npx nx serve web-app                           # Serve React web app (port 4200)
npx nx serve api                               # Serve Express API (port 3000)
npx nx build web-app                           # Build React app
npx nx build api                               # Build Express API

# Testing
npx nx test web-app                            # Test React app
npx nx test api                                # Test Express API
npx nx run-many -t test --parallel=3          # Test all projects in parallel

# Linting
npx nx lint web-app                            # Lint React app
npx nx lint api                                # Lint Express API
npx nx run-many -t lint                        # Lint all projects

# Running multiple tasks
npx nx run-many -t build                       # Build all projects
npx nx run-many -t lint test build            # Run multiple targets

# Affected commands (great for CI)
npx nx affected -t build                       # Build only affected projects
npx nx affected -t test                        # Test only affected projects
```

## 🎯 Adding New Features

### Generate a new React application:

```bash
npx nx g @nx/react:app my-app --directory=packages/my-app --bundler=vite
```

### Generate a new Express API:

```bash
npx nx g @nx/node:application my-api --directory=packages/my-api --framework=express
```

### Generate a new React component:

```bash
npx nx g @nx/react:component my-component --project=web-app
```

You can use `npx nx list` to see all available plugins and `npx nx list <plugin-name>` to see all generators for a specific plugin.

## Nx Cloud

Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## 🔗 Learn More

- [Nx Documentation](https://nx.dev)
- [React Monorepo Tutorial](https://nx.dev/getting-started/tutorials/react-monorepo-tutorial)
- [Module Boundaries](https://nx.dev/features/enforce-module-boundaries)
- [Docker Integration](https://nx.dev/recipes/nx-release/release-docker-images)
- [Playwright Testing](https://nx.dev/technologies/test-tools/playwright/introduction#e2e-testing)
- [Vite with React](https://nx.dev/recipes/vite)
- [Nx Cloud](https://nx.dev/ci/intro/why-nx-cloud)
- [Releasing Packages](https://nx.dev/features/manage-releases)

## 💬 Community

Join the Nx community:

- [Discord](https://go.nx.dev/community)
- [X (Twitter)](https://twitter.com/nxdevtools)
- [LinkedIn](https://www.linkedin.com/company/nrwl)
- [YouTube](https://www.youtube.com/@nxdevtools)
- [Blog](https://nx.dev/blog)

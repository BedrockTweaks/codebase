# Contributing to Bedrock Tweaks

Thank you for your interest in contributing to Bedrock Tweaks! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Branding Guidelines](#branding-guidelines)

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Set up your development environment (see below)
4. Create a new branch for your changes

## Development Setup

### Prerequisites

- Node.js >= 18
- pnpm 10.x

### Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The web app runs on [http://localhost:3000](http://localhost:3000).

## Making Changes

### Branch Naming

Use descriptive branch names:

- `feature/add-new-pack-type` - New features
- `fix/resolve-download-issue` - Bug fixes
- `docs/update-readme` - Documentation changes
- `refactor/improve-pack-selection` - Code refactoring

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(packs): add support for texture pack preview`
- `fix(api): resolve timeout on large pack downloads`
- `docs(readme): update installation instructions`

## Coding Standards

This project uses ESLint for code quality. Key rules:

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Always required
- **JSX**: Always use curly braces for attributes
- **TypeScript**: No `any` types; explicit return types on functions

Run `pnpm lint` before submitting PRs.

## Reporting Issues

Before opening a new issue, please check if there is already an existing issue that addresses your problem.

**For issues related to this codebase** (web app, build system, etc.):
- Check our [Issues](https://github.com/BedrockTweaks/codebase/issues) page
- If not found, open a new issue in this repository

**For issues related to packs** (resource packs, addons, crafting tweaks):
- Check the [Files repository Issues](https://github.com/BedrockTweaks/Files/issues) page
- Open pack-related issues in the Files repository

Provide as much detail as possible, including steps to reproduce the issue and any relevant error messages.

## License

By contributing to Bedrock Tweaks, you agree that your contributions will be licensed under the [License](LICENSE).

## Discord Role

As a token of our appreciation for your contribution, significant contributors will have a @Contributor role in
the [Discord](https://bedrocktweaks.net/discord). This role comes with some additional perks and recognition within the community.

We appreciate your contributions and look forward to your involvement in Bedrock Tweaks!
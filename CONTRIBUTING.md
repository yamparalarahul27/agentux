# Contributing to AgentUX

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/yamparalarahul27/agentux.git
cd agentux
npm install
npm test       # Run tests
npm run build  # Build package
npm run dev    # Watch mode
```

## Making Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes
4. Run tests: `npm test`
5. Run the build: `npm run build`
6. Commit using conventional commits:
   - `feat: add new feature`
   - `fix: resolve bug`
   - `docs: update readme`
7. Open a pull request

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation only
- `test:` — Adding or updating tests
- `chore:` — Maintenance tasks

## Project Structure

```
src/
├── analysis/       # Static file-system analysis (Node.js)
├── runtime/        # Browser runtime route detection
├── merge/          # Merges static + runtime data
├── visualization/  # React Flow canvas components
├── export/         # Markdown generation + clipboard
├── ui/             # Floating button, modal, toolbar
├── types.ts        # Shared type definitions
└── index.ts        # Public API
```

## Reporting Security Issues

Please do NOT open a public issue for security vulnerabilities. See [SECURITY.md](SECURITY.md) for responsible disclosure instructions.

## Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Be kind and constructive.

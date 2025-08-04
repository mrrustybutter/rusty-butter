# ESLint Config

Shared ESLint configuration for the Rusty Butter project.

## Installation

```bash
npm install --save-dev @rusty-butter/eslint-config
```

## Usage

In your `.eslintrc.js`:

```javascript
module.exports = {
  extends: ['@rusty-butter/eslint-config'],
  // Your custom rules here
};
```

## Configuration

This config includes:
- TypeScript support
- React/JSX rules
- Node.js best practices
- Import order enforcement
- Prettier integration

## Rules

Key rules enforced:
- No unused variables
- Consistent naming conventions
- Import sorting
- No console logs in production
- Proper async/await usage

## Overrides

For specific file patterns:
- Test files: Relaxed rules
- Config files: Node.js environment
- TypeScript: Strict type checking
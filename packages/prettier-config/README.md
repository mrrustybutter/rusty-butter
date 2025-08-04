# Prettier Config

Shared Prettier configuration for consistent code formatting across the Rusty Butter project.

## Installation

```bash
npm install --save-dev @rusty-butter/prettier-config
```

## Usage

In your `package.json`:

```json
{
  "prettier": "@rusty-butter/prettier-config"
}
```

Or in `.prettierrc.js`:

```javascript
module.exports = require('@rusty-butter/prettier-config');
```

## Configuration

Current settings:
- Print width: 100 characters
- Tab width: 2 spaces
- Single quotes
- Trailing commas: ES5
- No semicolons
- Arrow function parentheses: avoid when possible

## Integration

Works seamlessly with:
- ESLint (via eslint-config-prettier)
- VS Code (via Prettier extension)
- Git hooks (via husky/lint-staged)
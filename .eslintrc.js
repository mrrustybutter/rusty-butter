module.exports = {
  root: true,
  extends: ['@rusty-butter/eslint-config'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./packages/*/tsconfig.json'],
  },
};

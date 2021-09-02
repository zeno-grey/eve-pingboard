module.exports = {
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname
  },
  extends: [
    '../../.eslintrc.json',
  ],
  ignorePatterns: [
    '.eslintrc.js',
  ],
}

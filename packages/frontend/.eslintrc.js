module.exports = {
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    '../../.eslintrc.json',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
  ignorePatterns: [
    'build',
    '.eslintrc.js',
    'src/setupProxy.js',
  ],
}

module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: false,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/config/**',
    '!**/node_modules/**'
  ],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  testPathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['./tests/setup.js'],
};

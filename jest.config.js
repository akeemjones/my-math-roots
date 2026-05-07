module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: [
    '\\.claude[\\\\/]worktrees',
    'tests/(security|core|g1-unit-quiz)\\.test\\.js',
    'tests/analytics(-ingest)?\\.test\\.js',
  ],
};

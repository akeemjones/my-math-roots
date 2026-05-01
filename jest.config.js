module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: [
    '\\.claude[\\\\/]worktrees',
    'tests/(security|core)\\.test\\.js',
    'tests/analytics(-ingest)?\\.test\\.js',
  ],
};

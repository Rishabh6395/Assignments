module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', { isolatedModules: true }]
  },
  setupFiles: ['dotenv/config'],
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts', '!src/worker.ts'],
  coverageDirectory: 'coverage',
  testTimeout: 30000,
  verbose: true
};

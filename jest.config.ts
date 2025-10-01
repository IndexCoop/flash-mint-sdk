/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'mjs',
    'cjs',
    'jsx',
    'json',
    'node',
  ],
  roots: ['src'],
  // Increased timeout due to long taking tests
  testTimeout: 1000000,
  // Exclude e2e tests (they use Mocha via hardhat, not Jest)
  testPathIgnorePatterns: ['/node_modules/', '/src/tests/e2e/'],
}

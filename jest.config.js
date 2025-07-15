module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  testMatch: [
    "**/__tests__/**/*.ts",
    "**/__tests__/**/*.tsx",
    "**/?(*.)+(spec|test).ts",
    "**/?(*.)+(spec|test).tsx",
  ],
  transform: {
    "^.+\\.ts$": "ts-jest",
    "^.+\\.tsx$": "ts-jest",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/tests/**",
    "!src/**/*.test.ts",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
  testTimeout: 15000,
  verbose: true,

  // Performance optimizations
  maxWorkers: 2, // Limit workers to reduce memory usage
  workerIdleMemoryLimit: "512MB", // Limit worker memory
  detectOpenHandles: true, // Help detect memory leaks
  forceExit: true, // Force exit after tests complete

  // Cache configuration
  cache: true,
  cacheDirectory: "<rootDir>/node_modules/.cache/jest",

  moduleNameMapper: {
    "^@raycast/api$": "<rootDir>/src/tests/__mocks__/@raycast/api.js",
    "^@raycast/utils$": "<rootDir>/src/tests/__mocks__/@raycast/utils.ts",
  },

  transformIgnorePatterns: ["node_modules/(?!(@raycast)/)"],
  extensionsToTreatAsEsm: [],
};

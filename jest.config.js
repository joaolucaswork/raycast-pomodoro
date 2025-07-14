module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/tests/**",
    "!src/**/*.test.ts",
  ],
  moduleFileExtensions: ["ts", "js", "json"],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
  testTimeout: 10000,
  verbose: true,
  moduleNameMapper: {
    "^@raycast/api$": "<rootDir>/src/tests/__mocks__/@raycast/api.ts",
    "^@raycast/utils$": "<rootDir>/src/tests/__mocks__/@raycast/utils.ts",
  },

  transformIgnorePatterns: ["node_modules/(?!(@raycast)/)"],
  extensionsToTreatAsEsm: [],
};

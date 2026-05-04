import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  collectCoverageFrom: ["src/**/*.js", "src/**/*.ts","!**/node_modules/**"],
  testMatch: ["**/*.test.js", "**/*.test.ts"],
  coverageReporters: ["html", "text", "text-summary", "cobertura"],
  testEnvironment: "node",
  preset: "ts-jest",
  verbose: true,
  testTimeout:50000,
  transform: {
    "^.+\\.ts?$": [
      "ts-jest",
      {
        useESM: false,
        tsconfig: {
          module: "CommonJS",
          moduleResolution: "node",
          ignoreDeprecations: "6.0",
        },
      },
    ],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@src/(.*)$": "<rootDir>/src/$1",
    "^@test/(.*)$": "<rootDir>/test/$1",
  },
};

export default config;
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          target: "es2022",
        },
      },
    ],
  },
  moduleNameMapper: {
    "^lib/(.*)$": "<rootDir>/src/lib/$1",
    "^src/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "/.medusa/"],
  modulePathIgnorePatterns: ["<rootDir>/.medusa/"],
}

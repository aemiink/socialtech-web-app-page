module.exports = {
  rootDir: "..",
  testEnvironment: "node",
  testRegex: "test/.*\\.e2e-spec\\.ts$",
  moduleFileExtensions: ["js", "json", "ts"],
  transform: {
    "^.+\\.(t|j)s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
  },
  setupFiles: ["<rootDir>/test/jest.env.ts"],
  clearMocks: true,
};

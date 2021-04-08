module.exports = {
  testRegex: "(/src/.*?test).[jt]sx?$",
  collectCoverage: false,
  globalSetup: "./test/JestSetup.js",
  globalTeardown: "./test/JestTeardown.js",
  testEnvironment: "./test/MongoEnvironment.js",
  reporters: [
    "default",
    [
      "./node_modules/jest-html-reporter",
      {
        pageTitle: "Test Report",
        outputPath: "./reports/unit-test-report.html"
      }
    ]
  ]
};

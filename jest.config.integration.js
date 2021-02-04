module.exports = {
  testRegex: "(/test/(controllers|helpers)/.*?test).[jt]sx?$",
  testPathIgnorePatterns: ["test/helpers/AgendaHelper.test.js"],
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
        outputPath: "./reports/integration-test-report.html"
      }
    ]
  ]
};

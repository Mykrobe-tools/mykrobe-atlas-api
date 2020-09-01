module.exports = {
  testRegex: "(/test/(controllers|helpers)/.*?elasticsearch.test).[jt]sx?$",
  collectCoverage: false,
  testEnvironment: "node",
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

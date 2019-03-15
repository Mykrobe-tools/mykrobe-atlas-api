module.exports = {
  testRegex: "(/test/(controllers|helpers)/.*?test).[jt]sx?$",
  testPathIgnorePatterns: [
    "test/controllers/experiment.controller.elasticsearch.test.js",
    "test/helpers/AgendaHelper.test.js"
  ],
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

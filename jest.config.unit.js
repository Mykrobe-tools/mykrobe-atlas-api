module.exports = {
  testRegex: "(/test/(models|modules|transformers)/.*?test).[jt]sx?$",
  collectCoverage: false,
  testEnvironment: "node",
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

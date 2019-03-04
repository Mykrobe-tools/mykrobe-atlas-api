module.exports = {
  testRegex: "(/test/models/.*?test).[jt]sx?$",
  collectCoverage: false,
  testEnvironment: "node",
  reporters: [
    "default",
    [
      "./node_modules/jest-html-reporter",
      {
        pageTitle: "Test Report"
      }
    ]
  ]
};
/*testRegex: "(/test/models/.*?(test|spec))\\.[jt]sx?$",*/

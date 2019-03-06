module.exports = {
  testRegex: "(/test/modules/resumable/index.test).[jt]sx?$",
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
/*
  testRegex: "(/test/models/.*?(test|spec))\\.[jt]sx?$",
  testRegex: "(/test/(models|helpers)/.*?test).[jt]sx?$"
*/

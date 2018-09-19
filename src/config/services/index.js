export default {
  analysisApiUrl: process.env.ANALYSIS_API || "https://cli.mykrobe.com",
  analysisApiMaxRetries: 5,
  analysisApiBackOffPeriod: "in 20 minutes",
  treeResultsMonthsToLive: 6
};

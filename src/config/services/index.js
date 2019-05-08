export default {
  analysisApiUrl: process.env.ANALYSIS_API || "https://cli.mykrobe.com",
  analysisApiMaxRetries: 5,
  analysisApiBackOffPeriod: "in 20 minutes",
  bigsiApiUrl: process.env.BIGSI_API || "https://cli.mykrobe.com",
  bigsiApiMaxRetries: 5,
  bigsiApiBackOffPeriod: "in 20 minutes",
  treeResultsTTL: 4380, // 6 months
  bigsiResultsTTL: 168 // 7 days
};

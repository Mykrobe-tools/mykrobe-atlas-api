import geo from "./geo";

export default {
  analysisApiUrl: process.env.ANALYSIS_API || "https://cli.mykrobe.com",
  analysisApiMaxRetries: 5,
  analysisApiBackOffPeriod: "in 20 minutes",
  treeResultsTTL: 4380, // 6 months
  bigsiResultsTTL: 168, // 7 days
  geo
};

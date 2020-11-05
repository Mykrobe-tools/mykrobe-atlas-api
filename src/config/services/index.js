import geo from "./geo";
import mandrill from "./mandrill";

export default {
  analysisApiUrl: process.env.ANALYSIS_API || "https://cli.mykrobe.com",
  trackingApiUrl: process.env.TRACKING_API || "https://cli.mykrobe.com",
  analysisApiMaxRetries: 5,
  analysisApiBackOffPeriod: "in 20 minutes",
  treeResultsTTL: 1, // 1 hour
  bigsiResultsTTL: 1, // 1 hour
  geo,
  mandrill
};

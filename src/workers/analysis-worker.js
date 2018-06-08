import winston from "winston";
import axios from "axios";
import config from "../config/env";
import { ResourceGroupsTaggingAPI } from "aws-sdk";

const client = config.monqClient;
const worker = client.worker(["analysis"]);

worker.register({
  process: async (data, next) => {
    try {
      const response = await axios.post(
        `${config.analysisApiUrl}/analysis`,
        data
      );
      console.log(JSON.stringify(response.data));
      next();
    } catch (e) {
      next(e);
    }
  }
});

worker.on("dequeued", data => {
  winston.info(`Dequeued:${data}`);
});

worker.on("failed", data => {
  winston.info(`Failed:${JSON.stringify(data)}`);
});

worker.on("complete", data => {
  winston.info(`Complete:${data}`);
});

worker.on("error", () => {
  worker.stop();
});

worker.start();

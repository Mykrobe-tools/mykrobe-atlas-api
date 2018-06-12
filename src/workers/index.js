import winston from "winston";
import axios from "axios";
import config from "../config/env";

const agenda = config.agenda;

require("./sms-worker");
require("./email-worker");

agenda.define("call analysis api", async (job, done) => {
  const data = job.attrs.data;
  try {
    if (data.attempt < config.analysisApiMaxRetries) {
      await axios.post(`${config.analysisApiUrl}/analysis`, {
        file: data.file,
        sample_id: data.sample_id
      });
    }
    return done();
  } catch (e) {
    data.attempt++;
    await agenda.schedule(
      config.analysisApiBackOffPeriod,
      "call analysis api",
      data
    );
    return done(e);
  }
});

agenda.on("ready", () => {
  winston.info("agenda is ready and started.");
  agenda.start();
});

agenda.on("error", () => {
  agenda.stop();
});

import winston from "winston";
import axios from "axios";
import Audit from "../server/models/audit.model";
import config from "../config/env";

const agenda = config.agenda;

require("./sms-worker");
require("./email-worker");

agenda.define("call analysis api", async (job, done) => {
  const data = job.attrs.data;
  try {
    if (data.attempt < config.analysisApiMaxRetries) {
      const response = await axios.post(`${config.analysisApiUrl}/analysis`, {
        file: data.file,
        sample_id: data.sample_id
      });
      const audit = new Audit({
        sampleId: data.sample_id,
        fileLocation: data.file,
        status: "Successful",
        attempt: data.attempt + 1
      });
      await audit.save();
    }
    return done();
  } catch (e) {
    data.attempt++;
    const audit = new Audit({
      sampleId: data.sample_id,
      fileLocation: data.file,
      status: "Failed",
      attempt: data.attempt
    });
    await audit.save();
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

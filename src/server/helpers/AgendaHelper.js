import axios from "axios";
import Audit from "../models/audit.model";
import config from "../../config/env";
import { experimentEvent } from "../modules/events";

class AgendaHelper {
  static async callAnalysisApi(job, done) {
    const data = job.attrs.data;
    try {
      if (data.attempt < config.services.analysisApiMaxRetries) {
        const response = await axios.post(
          `${config.services.analysisApiUrl}/analyses`,
          {
            file: data.file,
            sample_id: data.sample_id
          }
        );
        const audit = new Audit({
          sampleId: data.sample_id,
          fileLocation: data.file,
          status: "Successful",
          taskId: response.data && response.data.task_id,
          type: "Analysis",
          attempt: data.attempt + 1
        });
        const savedAudit = await audit.save();
        experimentEvent.emit("analysis-started", savedAudit);
      }
      return done();
    } catch (e) {
      data.attempt++;
      const audit = new Audit({
        sampleId: data.sample_id,
        fileLocation: data.file,
        status: "Failed",
        type: "Analysis",
        attempt: data.attempt
      });
      await audit.save();
      await this.schedule(
        config.services.analysisApiBackOffPeriod,
        "call analysis api",
        data
      );
      return done(e);
    }
  }

  static async callDistanceApi(job, done) {
    const data = job.attrs.data;
    try {
      const response = await axios.post(
        `${config.services.analysisApiUrl}/distance`,
        {
          sample_id: data.sample_id
        }
      );
      const audit = new Audit({
        sampleId: data.sample_id,
        status: "Successful",
        taskId: response.data && response.data.task_id,
        type: "Distance",
        attempt: 1
      });
      const savedAudit = await audit.save();
      experimentEvent.emit("distance-search-started", savedAudit);
      return done();
    } catch (e) {
      return done(e);
    }
  }
}

export default AgendaHelper;

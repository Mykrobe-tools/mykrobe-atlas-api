import axios from "axios";
import Audit from "../models/audit.model";
import config from "../../config/env";

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
      await this.schedule(
        config.services.analysisApiBackOffPeriod,
        "call analysis api",
        data
      );
      return done(e);
    }
  }
}

export default AgendaHelper;

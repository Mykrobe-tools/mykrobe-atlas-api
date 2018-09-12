import axios from "axios";
import Audit from "../models/audit.model";
import config from "../../config/env";
import { experimentEventEmitter } from "../modules/events";

class AgendaHelper {
  static async callAnalysisApi(job, done) {
    const data = job.attrs.data;
    const uri = `${config.services.analysisApiUrl}/analyses`;
    try {
      if (data.attempt < config.services.analysisApiMaxRetries) {
        const response = await axios.post(uri, {
          file: data.file,
          sample_id: data.sample_id
        });
        const audit = new Audit({
          experimentId: data.sample_id,
          fileLocation: data.file,
          status: "Successful",
          taskId: response.data && response.data.task_id,
          type: "Predictor",
          attempt: data.attempt + 1,
          requestMethod: "post",
          requestUri: uri
        });
        const savedAudit = await audit.save();
        experimentEventEmitter.emit("analysis-started", savedAudit);
      }
      return done();
    } catch (e) {
      data.attempt++;
      const audit = new Audit({
        experimentId: data.sample_id,
        fileLocation: data.file,
        status: "Failed",
        type: "Predictor",
        attempt: data.attempt,
        requestMethod: "post",
        requestUri: uri
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
    const uri = `${config.services.analysisApiUrl}/distance`;
    try {
      const response = await axios.post(uri, {
        sample_id: data.sample_id
      });
      const audit = new Audit({
        experimentId: data.sample_id,
        status: "Successful",
        taskId: response.data && response.data.task_id,
        type: "Distance",
        attempt: 1,
        requestMethod: "post",
        requestUri: uri
      });
      const savedAudit = await audit.save();
      experimentEventEmitter.emit("distance-search-started", savedAudit);
      return done();
    } catch (e) {
      return done(e);
    }
  }

  static async callSearchApi(job, done) {
    const data = job.attrs.data;
    const uri = `${config.services.analysisApiUrl}/search`;
    try {
      const searchQuery = {
        result_id: data.searchId,
        user_id: data.user.id,
        query: data.bigsi
      };
      const searchType = data.bigsi.type;
      const response = await axios.post(uri, searchQuery);

      const audit = new Audit({
        status: "Successful",
        userId: data.user.id,
        searchId: data.searchId,
        taskId: response.data && response.data.task_id,
        type: searchQuery.bigsi.type,
        attempt: 1,
        requestMethod: "post",
        requestUri: uri
      });
      const savedAudit = await audit.save();

      experimentEventEmitter.emit(`${searchType}-started`, savedAudit);
      return done();
    } catch (e) {
      // wait for a period of time and retry the distance search
      data.attempt++;
      const audit = new Audit({
        status: "Failed",
        userId: data.user.id,
        searchId: data.searchId,
        taskId: response.data && response.data.task_id,
        type: searchQuery.bigsi.type,
        attempt: data.attempt,
        requestMethod: "post",
        requestUri: uri
      });
      await audit.save();
      await this.schedule(
        config.services.analysisApiBackOffPeriod,
        "call search api",
        data
      );
      return done(e);
    }
  }
}

export default AgendaHelper;

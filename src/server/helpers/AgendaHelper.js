import axios from "axios";
import Audit from "../models/audit.model";
import config from "../../config/env";
import { experimentEventEmitter } from "../modules/events";

class AgendaHelper {
  static async callAnalysisApi(job, done) {
    const data = job.attrs.data;
    const experiment = data.experiment;

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
        experimentEventEmitter.emit("analysis-started", {
          audit: savedAudit,
          experiment
        });
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
    const experiment = data.experiment;
    const uri = `${config.services.analysisApiUrl}/distance`;
    try {
      const response = await axios.post(uri, {
        sample_id: data.sample_id
      });
      const audit = new Audit({
        experimentId: experiment.id,
        status: "Successful",
        taskId: response.data && response.data.task_id,
        type: "Distance",
        attempt: 1,
        requestMethod: "post",
        requestUri: uri
      });
      const savedAudit = await audit.save();
      experimentEventEmitter.emit("distance-search-started", {
        audit: savedAudit,
        experiment
      });
      return done();
    } catch (e) {
      return done(e);
    }
  }

  static async callSearchApi(job, done) {
    const data = job.attrs.data;

    const search = data.search;
    const user = data.user;

    if (data && search) {
      const uri = `${config.services.analysisApiUrl}/search`;
      try {
        const searchQuery = {
          result_id: search.id,
          user_id: user.id,
          query: search.bigsi
        };
        const type = search.bigsi.type;

        const response = await axios.post(uri, searchQuery);

        const taskId =
          response.data && response.data.task_id ? response.data.task_id : null;

        const audit = new Audit({
          status: "Successful",
          userId: user.id,
          searchId: search.id,
          taskId,
          type,
          attempt: 1,
          requestMethod: "post",
          requestUri: uri
        });
        const savedAudit = await audit.save();

        experimentEventEmitter.emit(`${type}-started`, {
          audit: savedAudit,
          user,
          search
        });

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
}

export default AgendaHelper;

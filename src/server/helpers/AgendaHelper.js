import axios from "axios";
import uuid from "uuid";
import { ElasticsearchHelper } from "makeandship-api-common/lib/modules/elasticsearch";

import Audit from "../models/audit.model";
import Experiment from "../models/experiment.model";

import winston from "../modules/winston";
import { userEventEmitter, experimentEventEmitter } from "../modules/events";

import AuditJSONTransformer from "../transformers/AuditJSONTransformer";

import config from "../../config/env";

class AgendaHelper {
  static async callAnalysisApi(job, done) {
    const data = job.attrs.data;
    const experiment = data.experiment;

    const uri = `${config.services.analysisApiUrl}/analyses`;
    try {
      if (data.attempt < config.services.analysisApiMaxRetries) {
        const payload = {
          file: data.file,
          experiment_id: data.experiment_id
        };
        winston.info(`POST ${uri}`);
        winston.info(payload);
        const response = await axios.post(uri, payload);
        const audit = new Audit({
          experimentId: data.experiment_id,
          fileLocation: data.file,
          status: "Successful",
          taskId: response.data && response.data.task_id,
          type: "Predictor",
          attempt: data.attempt + 1,
          requestMethod: "post",
          requestUri: uri
        });
        const savedAudit = await audit.save();
        const auditJson = new AuditJSONTransformer().transform(savedAudit);

        experimentEventEmitter.emit("analysis-started", {
          audit: auditJson,
          experiment
        });
      }
      return done();
    } catch (e) {
      data.attempt++;
      const audit = new Audit({
        experimentId: data.experiment_id,
        fileLocation: data.file,
        status: "Failed",
        type: "Predictor",
        attempt: data.attempt,
        requestMethod: "post",
        requestUri: uri
      });
      await audit.save();
      await this.schedule(config.services.analysisApiBackOffPeriod, "call analysis api", data);
      return done(e);
    }
  }

  static async callDistanceApi(job, done) {
    const data = job.attrs.data;
    const experiment = data.experiment;
    const uri = `${config.services.analysisApiUrl}/distance`;
    try {
      const payload = {
        experiment_id: data.experiment_id,
        distance_type: data.distance_type
      };
      winston.info(`POST ${uri}`);
      winston.info(payload);
      const response = await axios.post(uri, payload);
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
      const auditJson = new AuditJSONTransformer().transform(savedAudit);

      experimentEventEmitter.emit("distance-search-started", {
        audit: auditJson,
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
      const searchQuery = {
        result_id: search.id,
        user_id: user.id,
        query: search.bigsi
      };
      winston.info(`POST ${uri}`);
      winston.info(searchQuery);
      const type = search.bigsi && search.bigsi.type ? search.bigsi.type : null;

      data.attempt = data.attempt ? data.attempt++ : 1;
      try {
        const response = await axios.post(uri, searchQuery);

        const taskId = response.data && response.data.task_id ? response.data.task_id : null;

        const audit = new Audit({
          status: "Successful",
          userId: user.id,
          searchId: search.id,
          taskId,
          type,
          attempt: data.attempt,
          requestMethod: "post",
          requestUri: uri
        });

        const savedAudit = await audit.save();
        const auditJson = new AuditJSONTransformer().transform(savedAudit);

        const event = `${type}-search-started`;
        userEventEmitter.emit(event, {
          audit: auditJson,
          user,
          search
        });

        return done();
      } catch (e) {
        const audit = new Audit({
          status: "Failed",
          userId: user.id,
          searchId: search.id,
          type,
          attempt: data.attempt,
          requestMethod: "post",
          requestUri: uri
        });
        await audit.save();

        // wait for a period of time and retry the distance search
        await this.schedule(config.services.analysisApiBackOffPeriod, "call search api", data);
        return done(e);
      }
    }
  }

  static async refreshIsolateId(job, done) {
    const uri = `${config.services.analysisApiUrl}/mapping`;
    const response = await axios.get(uri);
    const data = await this.getIsolateIdMapping(); //response.data;
    const ids = Object.keys(data);
    const experiments = await Experiment.findByIds(ids);
    experiments.forEach(async experiment => {
      const metadata = experiment.get("metadata");
      const newMetadata = JSON.parse(JSON.stringify(metadata)); // deep clone
      const isolateId = data[experiment.id];
      newMetadata.sample.isolateId = isolateId;
      experiment.set("metadata", newMetadata);
      const savedExperiment = await experiment.save();
      await ElasticsearchHelper.updateDocument(config, savedExperiment, "experiment");
    });
    return done();
  }

  static async getIsolateIdMapping() {
    const data = {};
    const experiments = await Experiment.list();
    experiments.forEach(experiment => {
      data[experiment.id] = uuid.v1();
    });
    return data;
  }
}

export default AgendaHelper;

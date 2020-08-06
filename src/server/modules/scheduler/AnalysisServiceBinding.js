import logger from "../logger";

import AnalysisService from "../analysis/AnalysisService";

import { userEventEmitter, experimentEventEmitter } from "../events";

import Audit from "../../models/audit.model";
import AuditJSONTransformer from "../../transformers/AuditJSONTransformer";

import config from "../../../config/env";

class AnalysisServiceBinding {
  constructor(scheduler) {
    this.scheduler = scheduler;
    this.service = new AnalysisService();
  }

  getData(job) {
    logger.debug(`AnalysisServiceBinding#getData: ${JSON.stringify(job)}`);
    if (job && job.attrs && job.attrs.data) {
      return job.attrs.data;
    }

    return null;
  }

  async predictor(job) {
    logger.debug(`AnalysisServiceBinding#predictor: enter`);
    logger.debug(`AnalysisServiceBinding#predictor: job: ${JSON.stringify(job)}`);
    const data = this.getData(job);
    logger.debug(`AnalysisServiceBinding#predictor: data: ${JSON.stringify(data)}`);

    if (data) {
      // service payload
      const experiment = data.experiment;
      const file = data.file;

      try {
        if (!data.attempt) {
          data.attempt = 0;
        }
        if (data.attempt < config.services.analysisApiMaxRetries) {
          const taskId = await this.service.predictor(experiment, file);
          logger.debug(`AnalysisServiceBinding#predictor: taskId: ${JSON.stringify(taskId)}`);
          // create an audit trail of the successful action
          const audit = new Audit({
            experimentId: experiment.id,
            fileLocation: file,
            status: "Successful",
            taskId,
            type: "Predictor",
            attempt: data.attempt + 1
          });
          logger.debug(`AnalysisServiceBinding#predictor: audit: ${JSON.stringify(audit)}`);

          const savedAudit = await audit.save();
          logger.debug(
            `AnalysisServiceBinding#predictor: savedAudit: ${JSON.stringify(savedAudit)}`
          );
          // emit an analysis started event
          const auditJson = new AuditJSONTransformer().transform(savedAudit);
          experimentEventEmitter.emit("analysis-started", {
            audit: auditJson,
            experiment
          });
          logger.debug(`AnalysisServiceBinding#predictor: send analysis started event`);
        }
      } catch (e) {
        logger.debug(`AnalysisServiceBinding#predictor: exception: ${e}`);
        // create an audit trail of the failure
        const audit = new Audit({
          experimentId: experiment.id,
          fileLocation: file,
          status: "Failed",
          type: "Predictor",
          attempt: data.attempt + 1
        });
        await audit.save();

        // re-run after backing off
        await this.scheduler.schedule(
          config.services.analysisApiBackOffPeriod,
          "call analysis api",
          data
        );

        throw e;
      }
    }

    logger.debug(`AnalysisServiceBinding#predictor: exit`);
  }

  async distance(job) {
    logger.debug(`AnalysisServiceBinding#distance: enter`);

    const data = this.getData(job);
    logger.debug(`AnalysisServiceBinding#distance: data: ${JSON.stringify(data)}`);

    if (data) {
      const experiment = data.experiment;
      const type = data.type;

      try {
        if (!data.attempt) {
          data.attempt = 0;
        }
        if (data.attempt < config.services.analysisApiMaxRetries) {
          const taskId = await this.service.distance(experiment, type);

          // create an audit trail of the successful action
          const audit = new Audit({
            experimentId: experiment.id,
            fileLocation: file,
            status: "Successful",
            taskId,
            type: "Distance",
            attempt: data.attempt + 1
          });
          const savedAudit = await audit.save();

          // emit an analysis started event
          const auditJson = new AuditJSONTransformer().transform(savedAudit);
          experimentEventEmitter.emit("distance-search-started", {
            audit: auditJson,
            experiment
          });
        }
      } catch (e) {
        logger.debug(`AnalysisServiceBinding#distance: exception: ${e}`);
        // create an audit trail of the failure
        const audit = new Audit({
          experimentId: experiment.id,
          fileLocation: file,
          status: "Failed",
          type: "Distance",
          attempt: data.attempt + 1
        });
        await audit.save();

        // re-run after backing off
        await this.scheduler.schedule(
          config.services.analysisApiBackOffPeriod,
          "call distance api",
          data
        );

        throw e;
      }
    }

    logger.debug(`AnalysisServiceBinding#distance: exit`);
  }

  async search(job) {
    logger.debug(`AnalysisServiceBinding#search: enter`);
    logger.debug(`AnalysisServiceBinding#search: job: ${JSON.stringify(job)}`);
    const data = this.getData(job);
    logger.debug(`AnalysisServiceBinding#search: data: ${JSON.stringify(data)}`);

    if (data) {
      const search = data.search;
      const user = data.user;

      try {
        if (!data.attempt) {
          data.attempt = 0;
        }
        if (data.attempt < config.services.analysisApiMaxRetries) {
          const taskId = await this.service.search(search);

          // create an audit trail of the successful action
          const audit = new Audit({
            status: "Successful",
            userId: user.id,
            searchId: search.id,
            taskId,
            type: search.type,
            attempt: data.attempt + 1
          });

          // emit an analysis started event
          const savedAudit = await audit.save();
          const auditJson = new AuditJSONTransformer().transform(savedAudit);

          const event = `${search.type}-search-started`;
          userEventEmitter.emit(event, {
            audit: auditJson,
            user,
            search
          });
        }
      } catch (e) {
        logger.debug(`AnalysisServiceBinding#search: exception: ${e}`);

        // create an audit trail of the failure
        const audit = new Audit({
          status: "Failed",
          userId: user.id,
          searchId: search.id,
          type: search.type,
          attempt: data.attempt + 1
        });
        await audit.save();

        // wait for a period of time and retry the search
        await this.aganda.schedule(
          config.services.analysisApiBackOffPeriod,
          "call search api",
          data
        );

        throw e;
      }
    }

    logger.debug(`AnalysisServiceBinding#search: exit`);
  }
}

export default AnalysisServiceBinding;

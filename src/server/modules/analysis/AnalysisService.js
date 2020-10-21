import axios from "axios";

import logger from "../logger";

import ExperimentHelper from "../../helpers/ExperimentHelper";

import config from "../../../config/env";

class AnalysisService {
  constructor() {}

  async predictor(experiment, file) {
    if (!experiment) {
      throw new Error(`Call to predictor service failed.  Missing experiment`);
    }
    if (!file) {
      throw new Error(`Call to predictor service failed.  Missing file`);
    }

    const uri = `${config.services.analysisApiUrl}/analyses`;
    const payload = {
      files: ExperimentHelper.localiseFilesForAnalysisApi(experiment.files),
      file: ExperimentHelper.localiseFilepathForAnalysisApi(file),
      sample_id: experiment.sampleId,
      callback_url: `/experiments/${experiment.id}/results`
    };
    logger.debug(`AnalysisService#predictor: POST ${uri}`);
    logger.debug(`AnalysisService#predictor: payload: ${JSON.stringify(payload, null, 2)}`);
    const response = await axios.post(uri, payload);
    if (response && response.data && response.data.task_id) {
      const taskId = response.data.task_id;
      logger.debug(`AnalysisService#predictor: taskId: ${taskId}`);
      return taskId;
    }

    throw new Error(`Call to predictor service failed.  Missing response`);
  }

  async distance(experiment, type) {
    if (!experiment) {
      throw new Error(`Call to distance service failed.  Missing experiment`);
    }
    if (!type) {
      throw new Error(`Call to distance service failed.  Missing type`);
    }

    const uri = `${config.services.analysisApiUrl}/distance`;
    const payload = {
      sample_id: experiment.sampleId,
      distance_type: type,
      callback_url: `/experiments/${experiment.id}/results`
    };
    logger.debug(`AnalysisService#distance: POST ${uri}`);
    logger.debug(`AnalysisService#distance: payload: ${JSON.stringify(payload, null, 2)}`);
    const response = await axios.post(uri, payload);
    if (response && response.data && response.data.task_id) {
      const taskId = response.data.task_id;
      logger.debug(`AnalysisService#distance: taskId: ${taskId}`);
      return taskId;
    }
  }
  async search(search) {
    if (!search) {
      throw new Error(`Call to search service failed.  Missing search`);
    }

    const uri = `${config.services.analysisApiUrl}/search`;
    const payload = search.bigsi;
    payload.search_id = search.id;
    logger.debug(`AnalysisService#search: POST ${uri}`);
    logger.debug(`AnalysisService#search: payload: ${JSON.stringify(payload, null, 2)}`);

    const response = await axios.post(uri, payload);
    if (response && response.data && response.data.task_id) {
      const taskId = response.data.task_id;
      logger.debug(`AnalysisService#search: taskId: ${taskId}`);
      return taskId;
    }
  }
  async refresh() {}
}

export default AnalysisService;

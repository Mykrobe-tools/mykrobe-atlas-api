import logger from "../logger";

class AnalysisService {
  constructor() {}

  async predictor(experiment, file) {
    if (!experiment) {
      throw new Exception(`Call to predictor service failed.  Missing experiment`);
    }
    if (!file) {
      throw new Exception(`Call to predictor service failed.  Missing file`);
    }

    const uri = `${config.services.analysisApiUrl}/analyses`;
    const payload = {
      file: ExperimentHelper.localiseFilepathForAnalysisApi(file),
      experiment_id: experiment.id
    };
    logger.debug(`AnalysisService#predictor: POST ${uri}`);
    logger.debug(`AnalysisService#predictor: payload: ${JSON.stringify(payload, null, 2)}`);
    const response = await axios.post(uri, payload);
    if (response && response.data && response.data.task_id) {
      const taskId = response.data.task_id;
      logger.debug(`AnalysisService#predictor: taskId: ${taskId}`);
      return taskId;
    }

    throw new Exception(`Call to predictor service failed.  Missing response`);
  }

  async distance(experiment, type) {
    if (!experiment) {
      throw new Exception(`Call to distance service failed.  Missing experiment`);
    }
    if (!type) {
      throw new Exception(`Call to distance service failed.  Missing type`);
    }

    const uri = `${config.services.analysisApiUrl}/distance`;
    const payload = {
      experiment_id: experiment.id,
      distance_type: type
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
      throw new Exception(`Call to search service failed.  Missing search`);
    }

    const uri = `${config.services.analysisApiUrl}/search`;
    const bigsi = search.bigsi;
    bigsi.search_id = search.id;
    logger.debug(`AnalysisService#search: POST ${uri}`);
    logger.debug(`AnalysisService#search: payload: ${JSON.stringify(bigsi, null, 2)}`);
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

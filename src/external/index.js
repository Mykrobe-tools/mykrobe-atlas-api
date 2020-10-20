import nock from "nock";
import uuid from "uuid";

import config from "../config/env";

import logger from "../server/modules/logger";

const enableMockAnalysisApi = () => {
  logger.debug(`enableMockAnalysisApi: enter`);
  nock(config.services.analysisApiUrl)
    .persist()
    .post("/analyses", body => body.file.endsWith("333-08.json"))
    .reply(200, {
      result: "success",
      task_id: "1447d80f-ca79-40ac-bc5d-8a02933323c3"
    });

  nock(config.services.analysisApiUrl)
    .persist()
    .post("/analyses", body => body.file.endsWith("333-09.json"))
    .reply(500, { result: "error" });
  logger.debug(`enableMockAnalysisApi: exit`);
};

const enableMockDistanceApi = () => {
  logger.debug(`enableMockDistanceApi: enter`);
  nock(config.services.analysisApiUrl)
    .persist()
    .post("/distance")
    .reply(200, {
      result: "success",
      task_id: "3a9ba217-4ccb-4108-9c01-60525e2ca905"
    });
  logger.debug(`enableMockDistanceApi: exit`);
};

const enableMockSearchApi = () => {
  logger.debug(`enableMockSearchApi: enter`);
  nock(config.services.analysisApiUrl)
    .persist()
    .post("/search", body => body.search_id !== "56c787ccc67fc16ccc13246")
    .reply(200, {
      result: "success",
      task_id: uuid.v1()
    });

  nock(config.services.analysisApiUrl)
    .persist()
    .post("/search", body => body.search_id === "56c787ccc67fc16ccc13246")
    .reply(500, { result: "error" });
  logger.debug(`enableMockSearchApi: exit`);
};

const enableMockTreeApi = () => {
  logger.debug(`enableMockTreeApi: enter`);
  nock(config.services.analysisApiUrl)
    .persist()
    .get("/tree/latest")
    .reply(200, {
      result: {
        tree: "00004012993414038108",
        version: "1.0"
      },
      type: "tree"
    });
  logger.debug(`enableMockTreeApi: exit`);
};

const enableMockIsolateIdMapping = () => {
  logger.debug(`enableMockIsolateIdMapping: enter`);
  nock(config.services.analysisApiUrl)
    .persist()
    .get("/mapping")
    .reply(200, [
      {
        "5bab4fcdf892541000b41f0c": uuid.v1()
      },
      {
        "5bab4fcdf892541000b41f0b": uuid.v1()
      }
    ]);
  logger.debug(`enableMockIsolateIdMapping: enter`);
};

const enableMockGenericAnalysisApi = () => {
  logger.debug(`enableMockGenericAnalysisApi: enter`);
  nock(config.services.analysisApiUrl)
    .persist()
    .post(/\bsearch|\banalyses/g)
    .reply(200, {
      result: "success",
      task_id: uuid.v1()
    });
  logger.debug(`enableMockGenericAnalysisApi: exot`);
};

const enableExternalThirdPartyMockServices = () => {
  logger.debug(`enableExternalThirdPartyMockServices: enter`);
  nock("https://dl.dropboxusercontent.com")
    .persist()
    .replyContentLength()
    .get("/1/view/1234")
    .reply(200, { chunk: "lorem ipsum" });
  logger.debug(`enableExternalThirdPartyMockServices: exit`);
};

const enableMockTrackingApi = () => {
  logger.debug(`enableMockTrackingApi: enter`);
  nock(config.services.trackingApiUrl)
    .persist()
    .post("/samples")
    .reply(201, {
      id: uuid.v1()
    });
  logger.debug(`enableMockTrackingApi: exit`);
};

const enableExternalAtlasMockServices = () => {
  logger.debug(`enableExternalAtlasMockServices: enter`);
  enableMockAnalysisApi();
  enableMockDistanceApi();
  enableMockSearchApi();
  enableMockTreeApi();
  enableMockIsolateIdMapping();
  enableMockGenericAnalysisApi();
  enableMockTrackingApi();
  logger.debug(`enableExternalAtlasMockServices: exit`);
};

export { enableExternalAtlasMockServices, enableExternalThirdPartyMockServices };

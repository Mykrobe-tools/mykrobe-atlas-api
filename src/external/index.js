import nock from "nock";
import uuid from "uuid";
import config from "../config/env";

const stubAnalysisApi = () => {
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
};

const stubDistanceApi = () => {
  nock(config.services.analysisApiUrl)
    .persist()
    .post("/distance")
    .reply(200, {
      result: "success",
      task_id: "3a9ba217-4ccb-4108-9c01-60525e2ca905"
    });
};

const stubSearchApi = () => {
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
};

const stubTreeApi = () => {
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
};

const stubIsolateIdMapping = () => {
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
};

const stubDevApis = () => {
  nock(config.services.analysisApiUrl)
    .persist()
    .post(/\bsearch|\banalyses/g)
    .reply(200, {
      result: "success",
      task_id: uuid.v1()
    });

  stubTreeApi();
  stubIsolateIdMapping();
};

const stub = Object.freeze({
  stubDevApis,
  stubTreeApi,
  stubIsolateIdMapping,
  stubAnalysisApi,
  stubDistanceApi,
  stubSearchApi
});

export default stub;

import request from "supertest";

import { experimentSearch as experimentSearchSchema } from "mykrobe-atlas-jsonschema";
import { ElasticService } from "makeandship-api-common/lib/modules/elasticsearch/";

import { SearchQuery } from "makeandship-api-common/lib/modules/elasticsearch/";
import { config, createApp } from "../setup";

import Experiment from "../../src/server/models/experiment.model";

import AgendaHelper from "../../src/server/helpers/AgendaHelper";

import experiments from "../fixtures/experiments";
import users from "../fixtures/users";

const esConfig = { type: "experiment", ...config.elasticsearch };
const elasticService = new ElasticService(esConfig, experimentSearchSchema);

const app = createApp();

let id = null;
let isolateId = null;
let token = null;

beforeEach(async () => {
  const experimentData = new Experiment(experiments.tbUploadMetadata);
  const experiment = await experimentData.save();
  const metadata = experiment.get("metadata");
  isolateId = metadata.sample.isolateId;
  id = experiment.id;
});

afterEach(async () => {
  await Experiment.deleteMany({});
});

describe("AgendaHelper ", () => {
  describe("#refresh isolateId", () => {
    it("should update the isolateId", async done => {
      await AgendaHelper.refreshIsolateId(null, jest.fn);

      let experimentAfterRefresh = await Experiment.get(id);
      let metadataAfterRefresh = experimentAfterRefresh.get("metadata");

      while (metadataAfterRefresh.sample.isolateId === isolateId) {
        experimentAfterRefresh = await Experiment.get(id);
        metadataAfterRefresh = experimentAfterRefresh.get("metadata");
      }

      expect(metadataAfterRefresh.sample.isolateId).not.toEqual(isolateId);
      done();
    });
  });
  describe("#refresh elasticsearch", () => {
    beforeEach(async done => {
      await elasticService.deleteIndex();
      await elasticService.createIndex();

      // index to elasticsearch
      const experiments = await Experiment.list();
      await elasticService.indexDocuments(experiments);

      let data = await elasticService.search(new SearchQuery({}), { type: "experiment" });
      while (data.hits.total < 1) {
        data = await elasticService.search(new SearchQuery({}), { type: "experiment" });
      }

      done();
    });
    it("should update the elasticsearch index", async done => {
      await AgendaHelper.refreshIsolateId(null, jest.fn);

      let resp = await elasticService.search(new SearchQuery({}), { type: "experiment" });
      let metadataFromES = resp.hits.hits[0]._source.metadata;

      while (metadataFromES.sample.isolateId === isolateId) {
        resp = await elasticService.search(new SearchQuery({}), { type: "experiment" });
        metadataFromES = resp.hits.hits[0]._source.metadata;
      }

      expect(metadataFromES.sample.isolateId).not.toEqual(isolateId);

      done();
    });
  });
});

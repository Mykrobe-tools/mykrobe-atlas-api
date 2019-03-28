import request from "supertest";

import { experiment as experimentSchema } from "mykrobe-atlas-jsonschema";
import { ElasticsearchHelper } from "makeandship-api-common/lib/modules/elasticsearch";

import { config, createApp } from "../setup";

import Experiment from "../../src/server/models/experiment.model";

import AgendaHelper from "../../src/server/helpers/AgendaHelper";

import experiments from "../fixtures/experiments";
import users from "../fixtures/users";

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
  await Experiment.remove({});
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
      await ElasticsearchHelper.deleteIndexIfExists(config);
      await ElasticsearchHelper.createIndex(config, experimentSchema, "experiment");

      // index to elasticsearch
      const experiments = await Experiment.list();
      await ElasticsearchHelper.indexDocuments(config, experiments, "experiment");

      let data = await ElasticsearchHelper.search(config, {}, "experiment");
      while (data.hits.total < 1) {
        data = await ElasticsearchHelper.search(config, {}, "experiment");
      }

      done();
    });
    it("should update the elasticsearch index", async done => {
      await AgendaHelper.refreshIsolateId(null, jest.fn);

      let resp = await ElasticsearchHelper.search(config, {}, "experiment");
      let metadataFromES = resp.hits.hits[0]._source.metadata;

      while (metadataFromES.sample.isolateId === isolateId) {
        resp = await ElasticsearchHelper.search(config, {}, "experiment");
        metadataFromES = resp.hits.hits[0]._source.metadata;
      }

      expect(metadataFromES.sample.isolateId).not.toEqual(isolateId);

      done();
    });
  });
});

import Experiment from "../../models/experiment.model";
import AgendaHelper from "../../helpers/AgendaHelper";
import { config, createApp } from "../setup";

const app = createApp();

const experiments = require("../fixtures/experiments");

let id = null;

beforeEach(async () => {
  const experimentData = new Experiment(experiments.tbUploadMetadata);
  const experiment = await experimentData.save();
  id = experiment.id;
});

/*
afterEach(async () => {
  await Experiment.remove({});
});
*/

describe("AgendaHelper ", () => {
  describe("#refresh isolateId", () => {
    it("should update the isolateId", async done => {
      const experimentBeforeRefresh = await Experiment.get(id);
      const metadataBeforeRefresh = experimentBeforeRefresh.get("metadata");
      const beforeRefreshIsolateId = metadataBeforeRefresh.sample.isolateId;

      await AgendaHelper.refreshIsolateId(null, jest.fn);

      let experimentAfterRefresh = await Experiment.get(id);
      let metadataAfterRefresh = experimentAfterRefresh.get("metadata");

      while (metadataAfterRefresh.sample.isolateId === beforeRefreshIsolateId) {
        experimentAfterRefresh = await Experiment.get(id);
        metadataAfterRefresh = experimentAfterRefresh.get("metadata");
      }

      expect(metadataAfterRefresh.sample.isolateId).not.toEqual(
        beforeRefreshIsolateId
      );
      done();
    });
  });
});

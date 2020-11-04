import setup from "../setup";

import Experiment from "../../src/server/models/experiment.model";
import ResultsParserFactory from "../../src/server/helpers/results/ResultsParserFactory";
import ExperimentSearchJSONTransformer from "../../src/server/transformers/ExperimentSearchJSONTransformer";

import experiments from "../fixtures/experiments";
import predictorINH from "../fixtures/files/predictorINH-0.9.json";

describe("ExperimentSearchJSONTransformer", () => {
  describe("#transform", () => {
    it("should remove calls and calls_summary from predictor lineage", async done => {
      const experimentData = new Experiment(experiments.tbUploadMetadataChinese);

      const result = ResultsParserFactory.create(predictorINH).parse();
      const results = [result];
      experimentData.set("results", results);

      const savedExperiment = await experimentData.save();
      const json = new ExperimentSearchJSONTransformer().transform(savedExperiment);

      expect(json).toHaveProperty("results");
      expect(json.results).toHaveProperty("predictor");
      expect(json.results.predictor).toHaveProperty("phylogenetics");
      expect(json.results.predictor.phylogenetics).toHaveProperty("lineage");

      expect(json.results.predictor.phylogenetics.lineage).toHaveProperty("lineage");
      expect(json.results.predictor.phylogenetics.lineage).not.toHaveProperty("calls");
      expect(json.results.predictor.phylogenetics.lineage).not.toHaveProperty("calls_summary");

      done();
    });
  });
});

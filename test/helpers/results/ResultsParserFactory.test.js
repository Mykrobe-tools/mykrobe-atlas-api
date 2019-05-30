import ResultsParserFactory from "../../../src/server/helpers/results/ResultsParserFactory";
import NearestNeighbourResultParser from "../../../src/server/helpers/results/NearestNeighbourResultParser";
import TreeDistanceResultParser from "../../../src/server/helpers/results/TreeDistanceResultParser";
import PredictorResultParser from "../../../src/server/helpers/results/PredictorResultParser";
import ProteinVariantResultParser from "../../../src/server/helpers/results/ProteinVariantResultParser";
import DnaVariantResultParser from "../../../src/server/helpers/results/DnaVariantResultParser";
import SequenceResultParser from "../../../src/server/helpers/results/SequenceResultParser";

describe("ResultsParserFactory", () => {
  describe("#create", () => {
    describe("when parsing a predictor result", () => {
      it("should return a PredictorResultParser", done => {
        const parser = ResultsParserFactory.create({
          type: "predictor"
        });
        expect(parser).toBeInstanceOf(PredictorResultParser);
        done();
      });
    });
    describe("when parsing a tree distance result", () => {
      it("should return a TreeDistanceResultParser", done => {
        const parser = ResultsParserFactory.create({
          type: "distance",
          subType: "tree-distance"
        });
        expect(parser).toBeInstanceOf(TreeDistanceResultParser);
        done();
      });
    });
    describe("when parsing a nearest neighbour", () => {
      it("should return a NearestNeighbourResultParser", done => {
        const parser = ResultsParserFactory.create({
          type: "distance",
          subType: "nearest-neighbour"
        });
        expect(parser).toBeInstanceOf(NearestNeighbourResultParser);
        done();
      });
    });
    describe("when parsing a sequence search result", () => {
      it("should return a SequenceSearchResultParser", done => {
        const parser = ResultsParserFactory.create({
          type: "sequence"
        });
        expect(parser).toBeInstanceOf(SequenceResultParser);
        done();
      });
    });
    describe("when parsing a protein variant search result", () => {
      it("should return a ProteinVariantResultParser", done => {
        const parser = ResultsParserFactory.create({
          type: "protein-variant"
        });
        expect(parser).toBeInstanceOf(ProteinVariantResultParser);
        done();
      });
    });
    describe("when parsing a protein variant search result", () => {
      it("should return a ProteinVariantResultParser", done => {
        const parser = ResultsParserFactory.create({
          type: "protein-variant"
        });
        expect(parser).toBeInstanceOf(ProteinVariantResultParser);
        done();
      });
    });
    describe("when parsing a dna variant search result", () => {
      it("should return a DnaVariantResultParser", done => {
        const parser = ResultsParserFactory.create({
          type: "dna-variant"
        });
        expect(parser).toBeInstanceOf(DnaVariantResultParser);
        done();
      });
    });
  });
});

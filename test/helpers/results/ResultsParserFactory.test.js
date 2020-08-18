import ResultsParserFactory from "../../../src/server/helpers/results/ResultsParserFactory";
import DistanceResultParser from "../../../src/server/helpers/results/DistanceResultParser";
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
    describe("when parsing a distance result", () => {
      it("should return a DistanceResultParser", done => {
        const parser = ResultsParserFactory.create({
          type: "distance"
        });
        expect(parser).toBeInstanceOf(DistanceResultParser);
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

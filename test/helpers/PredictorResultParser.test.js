import PredictorResultParser from "../../src/server/helpers/PredictorResultParser";
import MDR from "../fixtures/files/MDR_Results.json";
import {
  SUSCEPTIBLE_ALL,
  ONE_FIRST_CLASS_RESISTANCE,
  MULTIPLE_FIRST_CLASS_RESISTANCE,
  SECOND_CLASS_RESISTANCE,
  MDR_XDR_RESISTANCE,
  RESISTANCE_ALL
} from "../fixtures/files/results_payloads";

describe("PredictorResultParser", () => {
  describe("#parse", () => {
    it("should parse a result", done => {
      const parser = new PredictorResultParser(MDR);
      const result = parser.parse();
      expect(result).toHaveProperty("susceptibility");
      expect(result).toHaveProperty("phylogenetics");
      expect(result).toHaveProperty("variantCalls");
      expect(result).toHaveProperty("sequenceCalls");
      expect(result).toHaveProperty("kmer");
      expect(result).toHaveProperty("probeSets");
      expect(result).toHaveProperty("files");
      expect(result).toHaveProperty("version");
      expect(result).toHaveProperty("genotypeModel");
      expect(result).toHaveProperty("r");
      expect(result).toHaveProperty("mdr");
      expect(result).toHaveProperty("xdr");
      expect(result).toHaveProperty("tdr");

      done();
    });

    it("should parse susceptibility", done => {
      const parser = new PredictorResultParser(MDR);
      const result = parser.parse();
      const susceptibility = result.susceptibility;

      expect(susceptibility.length).toEqual(9);

      const mappedResults = {};
      susceptibility.forEach(item => {
        mappedResults[item.name] = item;
      });

      expect(mappedResults["Isoniazid"].name).toEqual("Isoniazid");
      expect(mappedResults["Isoniazid"].prediction).toEqual("R");
      expect(mappedResults["Isoniazid"].calledBy).toBeFalsy();

      expect(mappedResults["Kanamycin"].name).toEqual("Kanamycin");
      expect(mappedResults["Kanamycin"].prediction).toEqual("S");
      expect(mappedResults["Kanamycin"].calledBy).toBeFalsy();

      expect(mappedResults["Ethambutol"].name).toEqual("Ethambutol");
      expect(mappedResults["Ethambutol"].prediction).toEqual("S");
      expect(mappedResults["Ethambutol"].calledBy).toBeFalsy();

      expect(mappedResults["Streptomycin"].name).toEqual("Streptomycin");
      expect(mappedResults["Streptomycin"].prediction).toEqual("S");
      expect(mappedResults["Streptomycin"].calledBy).toBeFalsy();

      expect(mappedResults["Capreomycin"].name).toEqual("Capreomycin");
      expect(mappedResults["Capreomycin"].prediction).toEqual("S");
      expect(mappedResults["Capreomycin"].calledBy).toBeFalsy();

      expect(mappedResults["Quinolones"].name).toEqual("Quinolones");
      expect(mappedResults["Quinolones"].prediction).toEqual("S");
      expect(mappedResults["Quinolones"].calledBy).toBeFalsy();

      expect(mappedResults["Pyrazinamide"].name).toEqual("Pyrazinamide");
      expect(mappedResults["Pyrazinamide"].prediction).toEqual("S");
      expect(mappedResults["Pyrazinamide"].calledBy).toBeFalsy();

      expect(mappedResults["Rifampicin"].name).toEqual("Rifampicin");
      expect(mappedResults["Rifampicin"].prediction).toEqual("R");
      expect(mappedResults["Rifampicin"].calledBy).toBeTruthy();

      expect(mappedResults["Amikacin"].name).toEqual("Amikacin");
      expect(mappedResults["Amikacin"].prediction).toEqual("S");
      expect(mappedResults["Amikacin"].calledBy).toBeFalsy();

      done();
    });

    it("should parse phylogenetics", done => {
      const parser = new PredictorResultParser(MDR);
      const result = parser.parse();
      const phylogenetics = result.phylogenetics;

      expect(phylogenetics.length).toEqual(4);

      const mappedResults = {};
      phylogenetics.forEach(item => {
        mappedResults[item.type] = item;
      });

      expect(mappedResults["complex"].type).toEqual("complex");
      expect(mappedResults["complex"].result).toEqual("Mycobacterium_tuberculosis_complex");
      expect(mappedResults["complex"].percentCoverage).toEqual(99.722);
      expect(mappedResults["complex"].medianDepth).toEqual(122);

      expect(mappedResults["sub-complex"].type).toEqual("sub-complex");
      expect(mappedResults["sub-complex"].result).toEqual("Unknown");
      expect(mappedResults["sub-complex"].percentCoverage).toEqual(-1);
      expect(mappedResults["sub-complex"].medianDepth).toEqual(-1);

      expect(mappedResults["species"].type).toEqual("species");
      expect(mappedResults["species"].result).toEqual("Mycobacterium_tuberculosis");
      expect(mappedResults["species"].percentCoverage).toEqual(98.199);
      expect(mappedResults["species"].medianDepth).toEqual(116);

      expect(mappedResults["sub-species"].type).toEqual("sub-species");
      expect(mappedResults["sub-species"].result).toEqual("European_American");
      expect(mappedResults["sub-species"].percentCoverage).toEqual(100);
      expect(mappedResults["sub-species"].medianDepth).toEqual(117);

      done();
    });

    it("should calculate resistance, mdr, xdr and tdr", done => {
      const parser = new PredictorResultParser(MDR);
      const result = parser.parse();

      expect(result).toHaveProperty("r");
      expect(result).toHaveProperty("mdr");
      expect(result).toHaveProperty("xdr");
      expect(result).toHaveProperty("tdr");

      expect(result.r).toBe(true);
      expect(result.mdr).toBe(true);
      expect(result.xdr).toBe(false);
      expect(result.tdr).toBe(false);

      done();
    });
    describe("when patient is susceptible to all drugs", () => {
      it("should set all resistance indicators to false", done => {
        const parser = new PredictorResultParser(SUSCEPTIBLE_ALL);
        const result = parser.parse();

        expect(result).toHaveProperty("r");
        expect(result).toHaveProperty("mdr");
        expect(result).toHaveProperty("xdr");
        expect(result).toHaveProperty("tdr");

        expect(result.r).toBe(false);
        expect(result.mdr).toBe(false);
        expect(result.xdr).toBe(false);
        expect(result.tdr).toBe(false);

        done();
      });
    });
    describe("when patient is first line drug resitant", () => {
      describe("when resistant to one drug", () => {
        it("should set resistance to true and other indicators to false", done => {
          const parser = new PredictorResultParser(ONE_FIRST_CLASS_RESISTANCE);
          const result = parser.parse();

          expect(result).toHaveProperty("r");
          expect(result).toHaveProperty("mdr");
          expect(result).toHaveProperty("xdr");
          expect(result).toHaveProperty("tdr");

          expect(result.r).toBe(true);
          expect(result.mdr).toBe(false);
          expect(result.xdr).toBe(false);
          expect(result.tdr).toBe(false);

          done();
        });
      });
      describe("when resistant to multiple drugs", () => {
        it("should set resistance and mdr to true and other indicators to false", done => {
          const parser = new PredictorResultParser(MULTIPLE_FIRST_CLASS_RESISTANCE);
          const result = parser.parse();

          expect(result).toHaveProperty("r");
          expect(result).toHaveProperty("mdr");
          expect(result).toHaveProperty("xdr");
          expect(result).toHaveProperty("tdr");

          expect(result.r).toBe(true);
          expect(result.mdr).toBe(true);
          expect(result.xdr).toBe(false);
          expect(result.tdr).toBe(false);

          done();
        });
      });
    });
    describe("when patient is second line drug resitant", () => {
      it("should set resistance to true and other indicators to false", done => {
        const parser = new PredictorResultParser(SECOND_CLASS_RESISTANCE);
        const result = parser.parse();

        expect(result).toHaveProperty("r");
        expect(result).toHaveProperty("mdr");
        expect(result).toHaveProperty("xdr");
        expect(result).toHaveProperty("tdr");

        expect(result.r).toBe(true);
        expect(result.mdr).toBe(false);
        expect(result.xdr).toBe(false);
        expect(result.tdr).toBe(false);

        done();
      });
    });
    describe("when patient is first and second line drug resitant", () => {
      it("should set resistance and xdr to true and other indicators to false", done => {
        const parser = new PredictorResultParser(MDR_XDR_RESISTANCE);
        const result = parser.parse();

        expect(result).toHaveProperty("r");
        expect(result).toHaveProperty("mdr");
        expect(result).toHaveProperty("xdr");
        expect(result).toHaveProperty("tdr");

        expect(result.r).toBe(true);
        expect(result.mdr).toBe(true);
        expect(result.xdr).toBe(true);
        expect(result.tdr).toBe(false);

        done();
      });
      it("should set all resistance indicators to true", done => {
        const parser = new PredictorResultParser(RESISTANCE_ALL);
        const result = parser.parse();

        expect(result).toHaveProperty("r");
        expect(result).toHaveProperty("mdr");
        expect(result).toHaveProperty("xdr");
        expect(result).toHaveProperty("tdr");

        expect(result.r).toBe(true);
        expect(result.mdr).toBe(true);
        expect(result.xdr).toBe(true);
        expect(result.tdr).toBe(true);

        done();
      });
    });
  });
});

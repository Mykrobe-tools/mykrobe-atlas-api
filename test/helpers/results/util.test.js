import util from "../../../src/server/helpers/results/util";

import MDR from "../../fixtures/files/MDR_Results.json";

describe("util", () => {
  describe("#buildDrugResistanceSummary", () => {
    describe("when result is valid", () => {
      it("should summarise resistance of all drugs", () => {
        const experimentId = Object.keys(MDR.result).pop();
        const result = MDR.result[experimentId];
        const susceptibility = util.parseSusceptibility(result.susceptibility);
        const resistance = util.buildDrugResistanceSummary(susceptibility);

        expect(Object.keys(resistance).length).toEqual(11);
        [
          "Amikacin",
          "Capreomycin",
          "Ciprofloxacin",
          "Ethambutol",
          "Isoniazid",
          "Kanamycin",
          "Moxifloxacin",
          "Ofloxacin",
          "Pyrazinamide",
          "Rifampicin",
          "Streptomycin"
        ].forEach(drug => {
          expect(Object.keys(resistance).includes(drug)).toEqual(true);
        });
      });
    });
  });
  describe("#calculateResistance", () => {
    describe("when no results passes", () => {
      it("should return parsed results", () => {
        const resistance = util.calculateResistance();
        expect(resistance).toEqual(false);
      });
    });
    describe("when null results passed", () => {
      it("should return false", () => {
        const resistance = util.calculateResistance(null);
        expect(resistance).toEqual(false);
      });
    });
    describe("when empty results passed", () => {
      it("should return false", () => {
        const resistance = util.calculateResistance({});
        expect(resistance).toEqual(false);
      });
    });
    describe("when results do not show resistance", () => {
      it("should return false", () => {
        const summary = {
          Isoniazid: "S",
          Kanamycin: "S",
          Ethambutol: "S",
          Streptomycin: "S",
          Capreomycin: "S",
          Ciprofloxacin: "S",
          Moxifloxacin: "S",
          Ofloxacin: "S",
          Pyrazinamide: "S",
          Amikacin: "S",
          Rifampicin: "S"
        };
        const resistance = util.calculateResistance(summary);
        expect(resistance).toEqual(false);
      });
    });
    describe("when resistant to one drug", () => {
      it("should return true", () => {
        const summary = {
          Isoniazid: "S",
          Kanamycin: "S",
          Ethambutol: "S",
          Streptomycin: "S",
          Capreomycin: "S",
          Ciprofloxacin: "S",
          Moxifloxacin: "S",
          Ofloxacin: "S",
          Pyrazinamide: "S",
          Amikacin: "S",
          Rifampicin: "R"
        };
        const resistance = util.calculateResistance(summary);
        expect(resistance).toEqual(true);
      });
    });
    describe("when resistant to multiple drugs", () => {
      const summary = {
        Isoniazid: "S",
        Kanamycin: "S",
        Ethambutol: "S",
        Streptomycin: "S",
        Capreomycin: "S",
        Ciprofloxacin: "R",
        Moxifloxacin: "R",
        Ofloxacin: "S",
        Pyrazinamide: "S",
        Amikacin: "S",
        Rifampicin: "R"
      };
      const resistance = util.calculateResistance(summary);
      expect(resistance).toEqual(true);
    });
  });
  describe("#calculateMDR", () => {
    describe("when no results passes", () => {
      it("should return parsed results", () => {
        const mdr = util.calculateMDR();
        expect(mdr).toEqual(false);
      });
    });
    describe("when null results passed", () => {
      it("should return false", () => {
        const mdr = util.calculateMDR(null);
        expect(mdr).toEqual(false);
      });
    });
    describe("when empty results passed", () => {
      it("should return false", () => {
        const mdr = util.calculateMDR({});
        expect(mdr).toEqual(false);
      });
    });
    describe("when resistant to one first-line drug", () => {
      it("should return false", () => {
        const summary = {
          Isoniazid: "S",
          Kanamycin: "S",
          Ethambutol: "S",
          Streptomycin: "S",
          Capreomycin: "S",
          Ciprofloxacin: "S",
          Moxifloxacin: "S",
          Ofloxacin: "S",
          Pyrazinamide: "S",
          Amikacin: "S",
          Rifampicin: "R"
        };
        const mdr = util.calculateMDR(summary);
        expect(mdr).toEqual(false);
      });
    });
    describe("when resistant to both first-line drugs", () => {
      it("should return true", () => {
        const summary = {
          Isoniazid: "R",
          Kanamycin: "S",
          Ethambutol: "S",
          Streptomycin: "S",
          Capreomycin: "S",
          Ciprofloxacin: "S",
          Moxifloxacin: "S",
          Ofloxacin: "S",
          Pyrazinamide: "S",
          Amikacin: "S",
          Rifampicin: "R"
        };
        const mdr = util.calculateMDR(summary);
        expect(mdr).toEqual(true);
      });
    });
  });
  describe("#calculateXDR", () => {
    describe("when no results passes", () => {
      it("should return parsed results", () => {
        const xdr = util.calculateXDR();
        expect(xdr).toEqual(false);
      });
    });
    describe("when null results passed", () => {
      it("should return false", () => {
        const xdr = util.calculateXDR(null);
        expect(xdr).toEqual(false);
      });
    });
    describe("when empty results passed", () => {
      it("should return false", () => {
        const xdr = util.calculateXDR({});
        expect(xdr).toEqual(false);
      });
    });
    describe("when resistant to one first-line drug", () => {
      it("should return false", () => {
        const summary = {
          Isoniazid: "S",
          Kanamycin: "S",
          Ethambutol: "S",
          Streptomycin: "S",
          Capreomycin: "S",
          Ciprofloxacin: "S",
          Moxifloxacin: "S",
          Ofloxacin: "S",
          Pyrazinamide: "S",
          Amikacin: "S",
          Rifampicin: "R"
        };
        const xdr = util.calculateXDR(summary);
        expect(xdr).toEqual(false);
      });
    });
    describe("when resistant to both first-line drugs", () => {
      it("should return false", () => {
        const summary = {
          Isoniazid: "R",
          Kanamycin: "S",
          Ethambutol: "S",
          Streptomycin: "S",
          Capreomycin: "S",
          Ciprofloxacin: "S",
          Moxifloxacin: "S",
          Ofloxacin: "S",
          Pyrazinamide: "S",
          Amikacin: "S",
          Rifampicin: "R"
        };
        const xdr = util.calculateXDR(summary);
        expect(xdr).toEqual(false);
      });
    });
    describe("when resistant to both first-line drugs and a quinolone", () => {
      it("should return false", () => {
        const summary = {
          Isoniazid: "R",
          Kanamycin: "S",
          Ethambutol: "S",
          Streptomycin: "S",
          Capreomycin: "S",
          Ciprofloxacin: "R",
          Moxifloxacin: "S",
          Ofloxacin: "S",
          Pyrazinamide: "S",
          Amikacin: "S",
          Rifampicin: "R"
        };
        const xdr = util.calculateXDR(summary);
        expect(xdr).toEqual(false);
      });
    });
    describe("when resistant to both first-line drugs, a quinolone and a second line drug", () => {
      it("should return true", () => {
        // Ciprofloxacin as the Quinolone
        const xdrCiprofloxacin = util.calculateXDR({
          Isoniazid: "R",
          Kanamycin: "R",
          Ethambutol: "S",
          Streptomycin: "S",
          Capreomycin: "S",
          Ciprofloxacin: "R",
          Moxifloxacin: "S",
          Ofloxacin: "S",
          Pyrazinamide: "S",
          Amikacin: "S",
          Rifampicin: "R"
        });
        expect(xdrCiprofloxacin).toEqual(true);

        // Moxifloxacin as the Quinolone
        const xdrMoxifloxacin = util.calculateXDR({
          Isoniazid: "R",
          Kanamycin: "R",
          Ethambutol: "S",
          Streptomycin: "S",
          Capreomycin: "S",
          Ciprofloxacin: "S",
          Moxifloxacin: "R",
          Ofloxacin: "S",
          Pyrazinamide: "S",
          Amikacin: "S",
          Rifampicin: "R"
        });
        expect(xdrMoxifloxacin).toEqual(true);

        // Ofloxacin as the second-line
        const xdrOfloxacin = util.calculateXDR({
          Isoniazid: "R",
          Kanamycin: "R",
          Ethambutol: "S",
          Streptomycin: "S",
          Capreomycin: "S",
          Ciprofloxacin: "S",
          Moxifloxacin: "S",
          Ofloxacin: "R",
          Pyrazinamide: "S",
          Amikacin: "S",
          Rifampicin: "R"
        });
        expect(xdrOfloxacin).toEqual(true);

        // Kanamycin as the second-line
        const xdrKanamycin = util.calculateXDR({
          Isoniazid: "R",
          Kanamycin: "R",
          Ethambutol: "S",
          Streptomycin: "S",
          Capreomycin: "S",
          Ciprofloxacin: "S",
          Moxifloxacin: "S",
          Ofloxacin: "R",
          Pyrazinamide: "S",
          Amikacin: "S",
          Rifampicin: "R"
        });
        expect(xdrKanamycin).toEqual(true);

        // Amikacin as the second-line
        const xdrAmikacin = util.calculateXDR({
          Isoniazid: "R",
          Kanamycin: "S",
          Ethambutol: "S",
          Streptomycin: "S",
          Capreomycin: "S",
          Ciprofloxacin: "S",
          Moxifloxacin: "S",
          Ofloxacin: "R",
          Pyrazinamide: "S",
          Amikacin: "R",
          Rifampicin: "R"
        });
        expect(xdrAmikacin).toEqual(true);

        // Capreomycin as the second-line
        const xdrCapreomycin = util.calculateXDR({
          Isoniazid: "R",
          Kanamycin: "S",
          Ethambutol: "S",
          Streptomycin: "S",
          Capreomycin: "R",
          Ciprofloxacin: "S",
          Moxifloxacin: "S",
          Ofloxacin: "R",
          Pyrazinamide: "S",
          Amikacin: "S",
          Rifampicin: "R"
        });
        expect(xdrCapreomycin).toEqual(true);
      });
    });
  });
  describe("#calculateTDR", () => {
    describe("when no results passes", () => {
      it("should return parsed results", () => {
        const tdr = util.calculateTDR();
        expect(tdr).toEqual(false);
      });
    });
    describe("when null results passed", () => {
      it("should return false", () => {
        const tdr = util.calculateTDR(null);
        expect(tdr).toEqual(false);
      });
    });
    describe("when empty results passed", () => {
      it("should return false", () => {
        const tdr = util.calculateTDR({});
        expect(tdr).toEqual(false);
      });
    });
    describe("when some resistant to some drugs", () => {
      it("should return false", () => {
        const tdr = util.calculateTDR({
          Isoniazid: "R",
          Kanamycin: "S",
          Ethambutol: "S",
          Streptomycin: "S",
          Capreomycin: "R",
          Ciprofloxacin: "S",
          Moxifloxacin: "S",
          Ofloxacin: "R",
          Pyrazinamide: "S",
          Amikacin: "S",
          Rifampicin: "R"
        });
        expect(tdr).toEqual(false);
      });
    });
    describe("when some resistant to all drugs", () => {
      it("should return true", () => {
        const tdr = util.calculateTDR({
          Isoniazid: "R",
          Kanamycin: "R",
          Ethambutol: "R",
          Streptomycin: "R",
          Capreomycin: "R",
          Ciprofloxacin: "R",
          Moxifloxacin: "R",
          Ofloxacin: "R",
          Pyrazinamide: "R",
          Amikacin: "R",
          Rifampicin: "R"
        });
        expect(tdr).toEqual(true);
      });
    });
  });
  describe("#calculateResistanceAttributes", () => {
    describe("when result is valid", () => {
      it("should return parsed results", () => {
        const experimentId = Object.keys(MDR.result).pop();
        const result = MDR.result[experimentId];
        const susceptibility = util.parseSusceptibility(result.susceptibility);
        const resistance = util.buildDrugResistanceSummary(susceptibility);
      });
    });
  });
  describe("#getPredictorResult", () => {});
  describe("#parseSusceptibility", () => {
    describe("when result is valid", () => {
      it("should return parsed results", () => {
        const experimentId = Object.keys(MDR.result).pop();
        const result = MDR.result[experimentId];
        const susceptibility = util.parseSusceptibility(result.susceptibility);
      });
    });
  });
  describe("#parsePhylogenetics", () => {});
  describe("#parseDistance", () => {});
  describe("#buildRandomDistanceResult", () => {});
});

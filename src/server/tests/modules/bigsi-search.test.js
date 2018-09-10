import { createQuery, callApi } from "../../modules/bigsi-search";

require("../setup");

describe("bigsiSearch", () => {
  describe("#createQuery", () => {
    describe("when q contains any combination ACGT and threshold was passed", () => {
      it("should create sequence query with the threshold passed", () => {
        const result = createQuery(
          "CGGTCAGTCCGTTTGTTCTTGTGGCGAGTGTTGCCGTTTTCTTG",
          {
            threshold: 0.9,
            userId: "56c787ccc67fc16ccc1a5e92"
          }
        );
        expect(result.type).toEqual("sequence");
        expect(result.query.seq).toEqual(
          "CGGTCAGTCCGTTTGTTCTTGTGGCGAGTGTTGCCGTTTTCTTG"
        );
        expect(result.query.threshold).toEqual(0.9);
        expect(result.user_id).toEqual("56c787ccc67fc16ccc1a5e92");
      });
    });
    describe("when q contains any combination ACGT and no threshold passed", () => {
      it("should create sequence query with the threshold set to 1", () => {
        const result = createQuery(
          "CGGTCAGTCCGTTTGTTCTTGTGGCGAGTGTTGCCGTTTTCTTG",
          {
            userId: "56c787ccc67fc16ccc1a5e92"
          }
        );
        expect(result.type).toEqual("sequence");
        expect(result.query.seq).toEqual(
          "CGGTCAGTCCGTTTGTTCTTGTGGCGAGTGTTGCCGTTTTCTTG"
        );
        expect(result.query.threshold).toEqual(1);
        expect(result.user_id).toEqual("56c787ccc67fc16ccc1a5e92");
      });
    });
    describe("when q match the protein variant format", () => {
      it("should create protein variant query", () => {
        const result = createQuery("rpoB_S450L", {
          userId: "56c787ccc67fc16ccc1a5e92"
        });
        expect(result.type).toEqual("protein-variant");
        expect(result.query.ref).toEqual("S");
        expect(result.query.alt).toEqual("L");
        expect(result.query.pos).toEqual(450);
        expect(result.query.gene).toEqual("rpoB");
        expect(result.user_id).toEqual("56c787ccc67fc16ccc1a5e92");
      });
    });
    describe("when q doesnt match any format", () => {
      it("should return null query", () => {
        const result = createQuery("tuberculosis", {
          userId: "56c787ccc67fc16ccc1a5e92"
        });
        expect(result).toBe(null);
      });
    });
  });
  describe("#callApi", () => {
    describe("when calling the sequence search", () => {
      it("should return success with task_id", async () => {
        const query = {
          type: "sequence",
          query: {
            seq: "GTTCTTGTGGCGAGTGTTGC",
            threshold: 0.9
          },
          user_id: "5b8d19173470371d9e49811d"
        };
        const result = await callApi(query);
        expect(result.result).toEqual("success");
        expect(result.task_id).toBeTruthy();
      });
    });
    describe("when calling the protein variant search", () => {
      it("should return success with task_id", async () => {
        const query = {
          type: "protein-variant",
          query: {
            ref: "S",
            alt: "L",
            pos: 450,
            gene: "rpoB"
          },
          user_id: "5b8d19173470371d9e49811d",
          result_id: "56c787ccc67fc16ccc13245"
        };
        const result = await callApi(query);
        expect(result.result).toEqual("success");
        expect(result.task_id).toBeTruthy();
      });
    });
    describe("when throwing an error", () => {
      it("should return error", async () => {
        const query = {
          type: "protein-variant",
          query: {
            ref: "S",
            alt: "L",
            pos: 450,
            gene: "rpoB"
          },
          user_id: "56c787ccc67fc16ccc1a5e92",
          result_id: "56c787ccc67fc16ccc13245"
        };
        try {
          const result = await callApi(query);
          fail();
        } catch (e) {}
      });
    });
  });
});

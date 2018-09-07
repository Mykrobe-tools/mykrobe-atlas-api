import { createQuery } from "../../modules/bigsi-search";

describe("bigsiSearch", () => {
  describe("#createQuery", () => {
    describe("when q contains any combination ACGT and threshold was passed", () => {
      it("should create sequence query with the threshold passed", () => {
        const result = createQuery(
          "CGGTCAGTCCGTTTGTTCTTGTGGCGAGTGTTGCCGTTTTCTTG",
          {
            threshold: 0.9,
            userId: "56c787ccc67fc16ccc1a5e92",
            resultId: "5ce93416-b043-4032-8ae0-703c3a0fbad6"
          }
        );
        expect(result.type).toEqual("sequence");
        expect(result.query.seq).toEqual(
          "CGGTCAGTCCGTTTGTTCTTGTGGCGAGTGTTGCCGTTTTCTTG"
        );
        expect(result.query.threshold).toEqual(0.9);
        expect(result.user_id).toEqual("56c787ccc67fc16ccc1a5e92");
        expect(result.result_id).toEqual(
          "5ce93416-b043-4032-8ae0-703c3a0fbad6"
        );
      });
    });
    describe("when q contains any combination ACGT and no threshold passed", () => {
      it("should create sequence query with the threshold set to 1", () => {
        const result = createQuery(
          "CGGTCAGTCCGTTTGTTCTTGTGGCGAGTGTTGCCGTTTTCTTG",
          {
            userId: "56c787ccc67fc16ccc1a5e92",
            resultId: "5ce93416-b043-4032-8ae0-703c3a0fbad6"
          }
        );
        expect(result.type).toEqual("sequence");
        expect(result.query.seq).toEqual(
          "CGGTCAGTCCGTTTGTTCTTGTGGCGAGTGTTGCCGTTTTCTTG"
        );
        expect(result.query.threshold).toEqual(1);
        expect(result.user_id).toEqual("56c787ccc67fc16ccc1a5e92");
        expect(result.result_id).toEqual(
          "5ce93416-b043-4032-8ae0-703c3a0fbad6"
        );
      });
    });
    describe("when q match the protein variant format", () => {
      it("should create protein variant query", () => {
        const result = createQuery("rpoB_S450L", {
          userId: "56c787ccc67fc16ccc1a5e92",
          resultId: "5ce93416-b043-4032-8ae0-703c3a0fbad6"
        });
        expect(result.type).toEqual("protein-variant");
        expect(result.query.ref).toEqual("S");
        expect(result.query.alt).toEqual("L");
        expect(result.query.pos).toEqual("450");
        expect(result.query.gene).toEqual("rpoB");
        expect(result.user_id).toEqual("56c787ccc67fc16ccc1a5e92");
        expect(result.result_id).toEqual(
          "5ce93416-b043-4032-8ae0-703c3a0fbad6"
        );
      });
    });
    describe("when q doesnt match any format", () => {
      it("should return null query", () => {
        const result = createQuery("tuberculosis", {
          userId: "56c787ccc67fc16ccc1a5e92",
          resultId: "5ce93416-b043-4032-8ae0-703c3a0fbad6"
        });
        expect(result).toBe(null);
      });
    });
  });
});

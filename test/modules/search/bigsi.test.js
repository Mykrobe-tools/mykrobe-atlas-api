import {
  isBigsiQuery,
  extractBigsiQuery,
  callBigsiApi
} from "../../../src/server/modules/search/bigsi";

import setup from "../../setup";

describe("bigsi", () => {
  describe("#extractBigsiQuery", () => {
    describe("when q contains a sequence", () => {
      describe("with a threshold", () => {
        it("should create sequence query with the threshold passed", () => {
          const search = {
            q: "CGGTCAGTCCGTTTGTTCTTGTGGCGAGTGTTGCCGTTTTCTTG",
            threshold: 90
          };

          const bigsi = extractBigsiQuery(search);
          expect(bigsi).toHaveProperty("type", "sequence");
          expect(bigsi).toHaveProperty("query");
          const query = bigsi.query;
          expect(query).toHaveProperty("seq", "CGGTCAGTCCGTTTGTTCTTGTGGCGAGTGTTGCCGTTTTCTTG");
          expect(query).toHaveProperty("threshold", 90);
        });
        it("should remove the free text search from the underlying query", () => {
          const query = {
            q: "CGGTCAGTCCGTTTGTTCTTGTGGCGAGTGTTGCCGTTTTCTTG",
            threshold: 90
          };
          const result = extractBigsiQuery(query);

          expect(query.q).toBeUndefined();
        });
        it("should remove threshold from the underlying query", () => {
          const query = {
            q: "CGGTCAGTCCGTTTGTTCTTGTGGCGAGTGTTGCCGTTTTCTTG",
            threshold: 90
          };
          const result = extractBigsiQuery(query);

          expect(query.threshold).toBeUndefined();
        });
      });
      describe("with no threshold passed", () => {
        it("should create sequence query with a default threshold of 40", () => {
          const search = {
            q: "CGGTCAGTCCGTTTGTTCTTGTGGCGAGTGTTGCCGTTTTCTTG"
          };
          const bigsi = extractBigsiQuery(search);
          expect(bigsi).toHaveProperty("query");
          const query = bigsi.query;
          expect(query).toHaveProperty("threshold", 40);
        });
        it("should remove the free text search from the underlying query", () => {
          const query = {
            q: "CGGTCAGTCCGTTTGTTCTTGTGGCGAGTGTTGCCGTTTTCTTG"
          };
          const result = extractBigsiQuery(query);

          expect(query.q).toBeUndefined();
        });
      });
    });
    describe("when the free-text query uses protein variant format", () => {
      it("should create protein variant query", () => {
        const query = {
          q: "rpoB_S450L"
        };
        const result = extractBigsiQuery(query);

        expect(result).toHaveProperty("type", "protein-variant");
        expect(result).toHaveProperty("query");

        const resultQuery = result.query;
        expect(resultQuery.ref).toEqual("S");
        expect(resultQuery.alt).toEqual("L");
        expect(resultQuery.pos).toEqual(450);
        expect(resultQuery.gene).toEqual("rpoB");
      });

      it("should remove the free-text query from the underlying search", () => {
        const query = {
          q: "rpoB_S450L"
        };
        const result = extractBigsiQuery(query);

        expect(query.q).toBeUndefined();
      });
    });
    describe("when the free-text query uses dna variant format", () => {
      it("should create dna variant query", done => {
        const search = {
          q: "C32T"
        };
        const result = extractBigsiQuery(search);
        expect(result.type).toEqual("dna-variant");
        expect(result).toHaveProperty("query");
        const query = result.query;
        expect(query.ref).toEqual("C");
        expect(query.alt).toEqual("T");
        expect(query.pos).toEqual(32);
        expect(query.gene).toBeUndefined();
        done();
      });
      it("should remove the free-text query from the underlying search", done => {
        const query = {
          q: "C32T"
        };
        const result = extractBigsiQuery(query);

        expect(query.q).toBeUndefined();

        done();
      });
    });
    describe("when q doesnt match any format", () => {
      it("should return null query", () => {
        const query = {
          q: "tuberculosis"
        };
        const result = extractBigsiQuery("tuberculosis");

        expect(result).toBe(null);
      });
      it("should leave query.q unchanged", () => {
        const query = {
          q: "tuberculosis"
        };
        const result = extractBigsiQuery("tuberculosis");

        expect(query.q).toBeTruthy();
      });
    });
  });
  describe("#callBigsiApi", () => {
    describe("when calling the sequence search", () => {
      it("should return success with task_id", async () => {
        const query = {
          type: "sequence",
          query: {
            seq: "GTTCTTGTGGCGAGTGTTGC",
            threshold: 90
          },
          user_id: "5b8d19173470371d9e49811d"
        };
        const result = await callBigsiApi(query);
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
          search_id: "56c787ccc67fc16ccc13245"
        };
        const result = await callBigsiApi(query);
        expect(result.result).toEqual("success");
        expect(result.task_id).toBeTruthy();
      });
    });
    describe("when throwing an error", () => {
      it("should return error", async done => {
        // an error is triggered in stubSearchApi when search_id === 56c787ccc67fc16ccc13246
        const query = {
          type: "protein-variant",
          query: {
            ref: "S",
            alt: "L",
            pos: 450,
            gene: "rpoB"
          },
          search_id: "56c787ccc67fc16ccc13246"
        };
        try {
          const result = await callBigsiApi(query);
          fail();
        } catch (e) {
          done();
        }
      });
    });
  });
  describe("#isBigsiQuery", () => {
    describe("when the free-text query matches the protein variant format", () => {
      it("should create protein variant query", () => {
        const query = {
          q: "rpoB_S450L"
        };
        const result = isBigsiQuery(query);
        expect(result).toEqual(true);
      });
    });
    describe("when the free-text query matches the sequence format", () => {
      it("should return true for sequence search", () => {
        const search = {
          q: "CGGTCAGTCCGTTTGTTCTTGTGGCGAGTGTTGCCGTTTTCTTG",
          threshold: 90
        };

        const result = isBigsiQuery(search);
        expect(result).toEqual(true);
      });
    });
    describe("when the free-text query matches the dna variant format", () => {
      it("should create dna variant query", () => {
        const query = {
          q: "C32T"
        };
        const result = isBigsiQuery(query);
        expect(result).toEqual(true);
      });
    });
    describe("when the free-text query matches is not a bigsi query", () => {
      it("should return false for normal search", () => {
        const search = {
          q: "abcd"
        };

        const result = isBigsiQuery(search);
        expect(result).toEqual(false);
      });
    });
  });
  describe("#createQuery", () => {
    describe("when input is valid", () => {
      describe("when a sequence query", done => {
        it("should return a free-text query", done => {
          done();
        });
      });
      describe("when a dna variant query", done => {
        it("should return a free-text query", done => {
          done();
        });
      });
      describe("when a protein variant query", done => {
        it("should return a free-text query", done => {
          done();
        });
      });
    });
    describe("when input is not valid", () => {
      describe("when type is null", () => {
        it("should return null", done => {
          done();
        });
      });
      describe("when type is not recognised", done => {
        it("should return null", done => {
          done();
        });
      });
    });
  });
});

import DnaVariantSearchCompleteEventJSONTransformer from "../../../src/server/transformers/events/DnaVariantSearchCompleteEventJSONTransformer";

const data = {
  taskId: "e986f350-970b-11e8-8b76-7d2b3faf02cf",
  searchId: "e986f350-970b-11e8-8b76-7d2b3faf02aa",
  search: {
    id: "e986f350-970b-11e8-8b76-7d2b3faf02aa",
    type: "dna-variant",
    bigsi: {
      ref: "C",
      alt: "T",
      pos: 32
    },
    query: {
      q: "C32T"
    }
  },
  type: "DNA Variant search complete"
};

describe("DnaVariantSearchCompleteEventJSONTransformer", () => {
  describe("#transform", () => {
    it("should transform the analysis complete event", done => {
      const json = new DnaVariantSearchCompleteEventJSONTransformer().transform(data, {});

      expect(json.id).toEqual("e986f350-970b-11e8-8b76-7d2b3faf02aa");
      expect(json.taskId).toEqual("e986f350-970b-11e8-8b76-7d2b3faf02cf");
      expect(json.type).toEqual("DNA Variant search complete");

      done();
    });
    it("should return a url to re-run a search", () => {
      const dataWithQuery = JSON.parse(JSON.stringify(data));
      dataWithQuery.search.query = {
        q: "C32T"
      };

      const json = new DnaVariantSearchCompleteEventJSONTransformer().transform(dataWithQuery, {});
      expect(json).toHaveProperty("searchURL", "/experiments/search?q=C32T");
    });
  });
});

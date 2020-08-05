import ProteinVariantSearchCompleteEventJSONTransformer from "../../../src/server/transformers/events/ProteinVariantSearchCompleteEventJSONTransformer";

const data = {
  taskId: "e986f350-970b-11e8-8b76-7d2b3faf02cf",
  searchId: "e986f350-970b-11e8-8b76-7d2b3faf02aa",
  search: {
    id: "e986f350-970b-11e8-8b76-7d2b3faf02aa",
    type: "protein-variant",
    bigsi: {
      ref: "S",
      gene: "rpob",
      alt: "L",
      pos: 450
    },
    query: {
      q: "rpob_S450L"
    }
  },
  type: "Protein Variant search complete"
};

describe("ProteinVariantSearchCompleteEventJSONTransformer", () => {
  describe("#transform", () => {
    it("should transform the analysis complete event", done => {
      const json = new ProteinVariantSearchCompleteEventJSONTransformer().transform(data, {});

      expect(json.id).toEqual("e986f350-970b-11e8-8b76-7d2b3faf02aa");
      expect(json.taskId).toEqual("e986f350-970b-11e8-8b76-7d2b3faf02cf");
      expect(json.type).toEqual("Protein Variant search complete");

      done();
    });
    it("should return a url to re-run a search", () => {
      const dataWithQuery = JSON.parse(JSON.stringify(data));
      dataWithQuery.search.query = {
        q: "rpob_S450L"
      };

      const json = new ProteinVariantSearchCompleteEventJSONTransformer().transform(
        dataWithQuery,
        {}
      );
      expect(json).toHaveProperty("searchURL", "/experiments/search?q=rpob_S450L");
    });
  });
});

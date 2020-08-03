import SequenceSearchCompleteEventJSONTransformer from "../../../src/server/transformers/events/SequenceSearchCompleteEventJSONTransformer";

const data = {
  taskId: "e986f350-970b-11e8-8b76-7d2b3faf02cf",
  searchId: "e986f350-970b-11e8-8b76-7d2b3faf02aa",
  search: {
    id: "e986f350-970b-11e8-8b76-7d2b3faf02aa",
    type: "sequence",
    bigsi: {
      seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGT",
      threshold: 50
    }
  },
  type: "Sequence search complete"
};

describe("SequenceSearchCompleteEventJSONTransformer", () => {
  describe("#transform", () => {
    it("should transform the analysis complete event", done => {
      const json = new SequenceSearchCompleteEventJSONTransformer().transform(data, {});

      expect(json.id).toEqual("e986f350-970b-11e8-8b76-7d2b3faf02aa");
      expect(json.taskId).toEqual("e986f350-970b-11e8-8b76-7d2b3faf02cf");
      expect(json.type).toEqual("Sequence search complete");

      done();
    });
    it("should return a url to re-run a search", () => {});
  });
});

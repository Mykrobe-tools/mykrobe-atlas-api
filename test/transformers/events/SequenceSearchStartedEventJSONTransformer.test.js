import SequenceSearchStartedEventJSONTransformer from "../../../src/server/transformers/events/SequenceSearchStartedEventJSONTransformer";

const data = {
  search: {
    id: "e986f350-970b-11e8-8b76-7d2b3faf02aa",
    type: "sequence",
    bigsi: {
      seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGT",
      threshold: 50
    }
  },
  type: "Sequence search started"
};

describe("SequenceSearchStartedEventJSONTransformer", () => {
  describe("#transform", () => {
    it("should transform the analysis complete event", done => {
      const json = new SequenceSearchStartedEventJSONTransformer().transform(data, {});

      expect(json.id).toEqual("e986f350-970b-11e8-8b76-7d2b3faf02aa");
      expect(json.type).toEqual("Sequence search started");

      done();
    });
  });
});

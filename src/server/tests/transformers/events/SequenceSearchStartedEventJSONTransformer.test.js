import SequenceSearchStartedEventJSONTransformer from "../../../transformers/events/SequenceSearchStartedEventJSONTransformer";

const data = {
  taskId: "e986f350-970b-11e8-8b76-7d2b3faf02cf",
  searchId: "e986f350-970b-11e8-8b76-7d2b3faf02aa"
};

const search = {
  id: "e986f350-970b-11e8-8b76-7d2b3faf02aa",
  type: "sequence",
  bigsi: {
    seq: "GTCAGTCCGTTTGTTCTTGTGGCGAGTGT",
    threshold: 0.5
  }
};

describe("SequenceSearchStartedEventJSONTransformer", () => {
  describe("#transform", () => {
    it("should transform the analysis complete event", done => {
      const json = new SequenceSearchStartedEventJSONTransformer().transform(
        data,
        {}
      );
      console.log(json);
      done();
    });
  });
});

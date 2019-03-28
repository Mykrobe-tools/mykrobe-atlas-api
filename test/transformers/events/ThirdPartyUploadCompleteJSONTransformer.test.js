import ThirdPartyUploadCompleteJSONTransformer from "../../../src/server/transformers/events/ThirdPartyUploadCompleteJSONTransformer";

const status = {
  provider: "box",
  size: "3007920",
  totalSize: "3007920",
  fileLocation: "/path/to/file/MDR.fastq.gz"
};

const experiment = {
  id: "123"
};

describe("ThirdPartyUploadProgressJSONTransformer", () => {
  describe("#transform", () => {
    it("should transform the 3rd party upload complete event", done => {
      const json = new ThirdPartyUploadCompleteJSONTransformer().transform(
        {
          status,
          experiment
        },
        {}
      );

      expect(json.id).toEqual("123");
      expect(json.provider).toEqual("box");
      expect(json.complete).toEqual("100.00");
      expect(json.size).toEqual("3007920");
      expect(json.totalSize).toEqual(3007920);
      expect(json.file).toEqual("MDR.fastq.gz");
      expect(json.event).toEqual("Upload via 3rd party complete");

      done();
    });
  });
});

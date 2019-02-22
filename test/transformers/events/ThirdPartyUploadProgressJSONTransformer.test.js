import ThirdPartyUploadProgressJSONTransformer from "../../../transformers/events/ThirdPartyUploadProgressJSONTransformer";

const status = {
  provider: "box",
  size: "1735976",
  totalSize: "3007920",
  fileLocation: "/path/to/file/MDR.fastq.gz"
};

const experiment = {
  id: "123"
};

describe("ThirdPartyUploadProgressJSONTransformer", () => {
  describe("#transform", () => {
    it("should transform the 3rd party upload progress event", done => {
      const json = new ThirdPartyUploadProgressJSONTransformer().transform(
        {
          status,
          experiment
        },
        {}
      );

      expect(json.id).toEqual("123");
      expect(json.provider).toEqual("box");
      expect(json.complete).toEqual("57.71");
      expect(json.size).toEqual("1735976");
      expect(json.totalSize).toEqual(3007920);
      expect(json.file).toEqual("MDR.fastq.gz");
      expect(json.event).toEqual("Upload via 3rd party progress");

      done();
    });
  });
});

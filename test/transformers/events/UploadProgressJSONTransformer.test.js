import UploadProgressJSONTransformer from "../../../transformers/events/UploadProgressJSONTransformer";

const status = {
  identifier: "217685411-MDRfastqgz",
  chunkNumber: "174",
  totalChunks: "207",
  chunkSize: 1048576,
  totalSize: 217685411,
  filename: "MDR.fastq.gz",
  originalFilename: "",
  type: "application/x-gzip",
  checksum: "3b85715ace03c780dc75936b93dcb2b8",
  chunkFilename:
    "/tmp/uploads/experiments/5b6323763d2e3416ee01ae69/file/resumable-217685411-MDRfastqgz.1",
  complete: false,
  verifiedTotalChunks: 207,
  percentageComplete: 84.0630917874396135,
  message: "Chunk 174 uploaded"
};

const experiment = {
  id: "123"
};

describe("UploadProgressJSONTransformer", () => {
  describe("#transform", () => {
    it("should transform the analysis complete event", done => {
      const json = new UploadProgressJSONTransformer().transform(
        {
          status,
          experiment
        },
        {}
      );

      expect(json.id).toEqual("123");
      expect(json.complete).toEqual("84.06");
      expect(json.count).toEqual("174");
      expect(json.total).toEqual("207");
      expect(json.file).toEqual("MDR.fastq.gz");
      expect(json.event).toEqual("Upload progress");

      done();
    });
  });
});

import UploadCompleteJSONTransformer from "../../transformers/events/UploadCompleteJSONTransformer";

const data = {
  identifier: "217685411-MDRfastqgz",
  chunkNumber: "207",
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
  percentageComplete: 100,
  message: "Chunk 207 uploaded"
};

describe("UploadCompleteJSONTransformer", () => {
  describe("#transform", () => {
    it("should transform the analysis complete event", done => {
      const json = new UploadCompleteJSONTransformer().transform(data, {
        id: "123"
      });

      expect(json.id).toEqual("123");
      expect(json.complete).toEqual("100.00");
      expect(json.count).toEqual("207");
      expect(json.total).toEqual("207");
      expect(json.file).toEqual("MDR.fastq.gz");
      expect(json.event).toEqual("Upload complete");

      done();
    });
  });
});

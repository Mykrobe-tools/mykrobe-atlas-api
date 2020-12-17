import EventJSONTransformer from "../../src/server/transformers/EventJSONTransformer";

import events from "../fixtures/events";

describe("EventJSONTransformer", () => {
  describe("#transform", () => {
    it("should transform events", done => {
      const json = new EventJSONTransformer().transform(events.valid);

      expect(json).toHaveProperty("openUploads");
      expect(json).toHaveProperty("openSearches");
      expect(json).toHaveProperty("openAnalysis");

      done();
    });

    it("should transform nested arrays", done => {
      const { openUploads } = new EventJSONTransformer().transform(events.valid);

      expect(openUploads[0]).toHaveProperty("identifier");
      expect(openUploads[0]).toHaveProperty("chunkNumber");
      expect(openUploads[0]).toHaveProperty("totalChunks");
      expect(openUploads[0]).toHaveProperty("chunkSize");
      expect(openUploads[0]).toHaveProperty("totalSize");
      expect(openUploads[0]).toHaveProperty("filename");
      expect(openUploads[0]).toHaveProperty("type");

      done();
    });
  });
});

import AuditJSONTransformer from "../../src/server/transformers/AuditJSONTransformer";

import audits from "../fixtures/audits";

describe("AuditJSONTransformer", () => {
  describe("#transform", () => {
    it("should transform audits", done => {
      const json = new AuditJSONTransformer().transform(audits.valid);

      expect(json).toHaveProperty("taskId");
      expect(json).toHaveProperty("experimentId");
      expect(json).toHaveProperty("searchId");
      expect(json).toHaveProperty("requestMethod");
      expect(json).toHaveProperty("requestUri");
      expect(json).toHaveProperty("fileLocation");
      expect(json).toHaveProperty("status");
      expect(json).toHaveProperty("type");
      expect(json).toHaveProperty("attempt");

      done();
    });

    it("should remove blacklisted fields", done => {
      const json = new AuditJSONTransformer().transform({ __v: "1.0", ...audits.valid });

      expect(json).toHaveProperty("taskId");
      expect(json).not.toHaveProperty("__v");

      done();
    });
  });
});

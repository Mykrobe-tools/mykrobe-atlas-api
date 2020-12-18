import OrganisationJSONTransformer from "../../src/server/transformers/OrganisationJSONTransformer";

import organisations from "../fixtures/organisations";

describe("OrganisationJSONTransformer", () => {
  describe("#transform", () => {
    it("should transform members", done => {
      const json = new OrganisationJSONTransformer().transform(organisations.apex);

      expect(json).toHaveProperty("name");
      expect(json).toHaveProperty("slug");

      done();
    });
  });
});

import MemberJSONTransformer from "../../src/server/transformers/MemberJSONTransformer";

import members from "../fixtures/members";

describe("MemberJSONTransformer", () => {
  describe("#transform", () => {
    it("should transform members", done => {
      const json = new MemberJSONTransformer().transform(members.approved);

      expect(json).toHaveProperty("firstname");
      expect(json).toHaveProperty("lastname");
      expect(json).toHaveProperty("phone");
      expect(json).toHaveProperty("email");
      expect(json).toHaveProperty("username");
      expect(json).toHaveProperty("action");

      done();
    });
  });
});

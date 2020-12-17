import UserJSONTransformer from "../../src/server/transformers/UserJSONTransformer";

import users from "../fixtures/users";
import organisations from "../fixtures/organisations";

describe("UserJSONTransformer", () => {
  describe("#transform", () => {
    it("should transform users", done => {
      const json = new UserJSONTransformer().transform(users.thomas);

      expect(json).toHaveProperty("firstname");
      expect(json).toHaveProperty("lastname");
      expect(json).toHaveProperty("phone");
      expect(json).toHaveProperty("email");
      expect(json).toHaveProperty("username");

      done();
    });

    it("should transform nested organisation", done => {
      const { organisation } = new UserJSONTransformer().transform({
        organisation: organisations.apex,
        ...users.thomas
      });

      expect(organisation).toHaveProperty("name");
      expect(organisation).toHaveProperty("slug");

      done();
    });
  });
});

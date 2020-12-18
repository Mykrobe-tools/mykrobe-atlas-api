import InvitationJSONTransformer from "../../src/server/transformers/InvitationJSONTransformer";

import invitations from "../fixtures/invitations";
import organisations from "../fixtures/organisations";

describe("InvitationJSONTransformer", () => {
  describe("#transform", () => {
    it("should transform invitations", done => {
      const json = new InvitationJSONTransformer().transform(invitations.accepted);

      expect(json).toHaveProperty("status");

      done();
    });

    it("should transform nested organisation", done => {
      const { organisation } = new InvitationJSONTransformer().transform({
        organisation: organisations.apex,
        ...invitations.accepted
      });

      expect(organisation).toHaveProperty("name");
      expect(organisation).toHaveProperty("slug");

      done();
    });
  });
});

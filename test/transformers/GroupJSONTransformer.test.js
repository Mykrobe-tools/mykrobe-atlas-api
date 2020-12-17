import GroupJSONTransformer from "../../src/server/transformers/GroupJSONTransformer";

import groups from "../fixtures/groups/default";

describe("GroupJSONTransformer", () => {
  describe("#transform", () => {
    it("should transform groups", done => {
      const json = new GroupJSONTransformer().transform(groups.medoza);

      expect(json).toHaveProperty("name");
      expect(json).toHaveProperty("annotation");

      done();
    });

    it("should transform nested search queries", done => {
      const { searchQuery } = new GroupJSONTransformer().transform(groups.salta);

      expect(searchQuery.length).toEqual(2);

      done();
    });
  });
});

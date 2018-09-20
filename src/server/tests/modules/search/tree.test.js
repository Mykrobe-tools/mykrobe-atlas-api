import { callTreeApi } from "../../../modules/search/tree";
import setup from "../../setup";

describe("tree", () => {
  describe("#callBigsiApi", () => {
    it("should return success with a result", async () => {
      const result = await callTreeApi();
      expect(result.tree).toBeTruthy();
      expect(result.version).toBeTruthy();
    });
  });
});

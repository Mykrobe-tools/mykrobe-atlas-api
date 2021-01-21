import axios from "axios";
import { callTreeApi } from "../../../src/server/modules/search/tree";

jest.mock("axios");

describe("tree", () => {
  describe("#callTreeApi", () => {
    let result;
    beforeEach(async done => {
      axios.get.mockClear().mockImplementation(() =>
        Promise.resolve({
          data: {
            result: {
              tree: "00004012993414038108",
              version: "1.0"
            },
            type: "tree"
          }
        })
      );
      result = await callTreeApi();

      done();
    });
    it("should call get", done => {
      expect(axios.get).toHaveBeenCalledTimes(1);
      done();
    });
    it("should call the tree API URL", done => {
      const url = axios.get.mock.calls[0][0];
      expect(url).toEqual("https://cli.mykrobe.com/tree/latest");
      done();
    });
    it("should return success with a result", async () => {
      expect(result.tree).toBeTruthy();
      expect(result.version).toBeTruthy();
    });
  });
});

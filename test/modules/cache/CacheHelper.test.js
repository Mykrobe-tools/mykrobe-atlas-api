import CacheHelper from "../../../src/server/modules/cache/CacheHelper";

describe("CacheHelper", () => {
  describe("#getObjectHash", () => {
    describe("when valid", () => {
      describe("when passing an object", () => {
        it("should return a hash", () => {
          const hash = CacheHelper.getObjectHash({
            one: "two",
            three: "four"
          });
          expect(hash).toEqual("c38b288413ff8c5f0dfe4213ff36adc9350e10de");
        });
      });
      describe("when passing the same object with different attribute order", () => {
        it("should return the same hash", () => {
          const hash = CacheHelper.getObjectHash({
            one: "two",
            three: "four"
          });
          const reverseHash = CacheHelper.getObjectHash({
            three: "four",
            one: "two"
          });
          expect(hash).toEqual(reverseHash);
        });
      });
    });
    describe("when not valid", () => {
      describe("when the object is empty", () => {
        it("should return null", () => {
          expect(CacheHelper.getObjectHash()).toEqual(null);
        });
      });
      describe("when the object is null", () => {
        it("should return null", () => {
          expect(CacheHelper.getObjectHash(null)).toEqual(null);
        });
      });
      describe("when the object is undefined", () => {
        it("should return null", () => {
          expect(CacheHelper.getObjectHash(undefined)).toEqual(null);
        });
      });
    });
  });
});

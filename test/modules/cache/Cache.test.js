import RedisService from "makeandship-api-common/lib/modules/cache/services/RedisService";

import Cache from "../../../src/server/modules/cache/Cache";

describe("Cache", () => {
  describe("#getKey", () => {
    describe("when valid", () => {
      it("should add a prefix", () => {
        expect(Cache.getKey("c38b288413ff8c5f0dfe4213ff36adc9350e10de")).toEqual(
          "atlas-c38b288413ff8c5f0dfe4213ff36adc9350e10de"
        );
      });
    });
    describe("when not valid", () => {
      describe("when the key is empty", () => {
        it("should return null", () => {
          expect(Cache.getKey()).toEqual(null);
        });
      });
      describe("when the key is null", () => {
        it("should return null", () => {
          expect(Cache.getKey(null)).toEqual(null);
        });
      });
      describe("when the key is undefined", () => {
        it("should return null", () => {
          expect(Cache.getKey(undefined)).toEqual(null);
        });
      });
    });
  });
  describe("#get", () => {
    describe("when valid", () => {
      let mockRedisServiceGet = null;
      let value = null;
      beforeEach(async done => {
        // mock the RedisService.get method to return a fixed value regardless of key
        mockRedisServiceGet = jest.spyOn(RedisService, "get").mockImplementation(() => {
          return { one: "two" };
        });

        value = await Cache.get("key");
        done();
      });
      afterEach(() => {
        jest.clearAllMocks();
      });
      it("should call with a prefixed key", () => {
        expect(mockRedisServiceGet).toHaveBeenCalledWith("atlas-key");
      });
      it("should call RedisService.get", () => {
        expect(mockRedisServiceGet).toHaveBeenCalledTimes(1);
      });
      it("should return the cached value", () => {
        expect(value).toEqual({ one: "two" });
      });
    });
    describe("when not valid", () => {
      let mockRedisServiceGet = null;
      let value = null;
      beforeEach(async done => {
        // mock the RedisService.get method to return a fixed value regardless of key
        mockRedisServiceGet = jest.spyOn(RedisService, "get").mockImplementation(() => {
          return { one: "two" };
        });

        value = await Cache.get();
        done();
      });
      afterEach(() => {
        jest.clearAllMocks();
      });
      it("should not call the underlying service", () => {
        expect(mockRedisServiceGet).toHaveBeenCalledTimes(0);
      });
      it("should return null", () => {
        expect(value).toEqual(null);
      });
    });
  });
  describe("#set", () => {
    describe("when valid", () => {
      let mockRedisServiceSet = null;
      beforeEach(async done => {
        // mock the RedisService.set method
        mockRedisServiceSet = jest.spyOn(RedisService, "set").mockImplementation();

        await Cache.set("key", { one: "two" });
        done();
      });
      afterEach(() => {
        jest.clearAllMocks();
      });
      it("should call with a prefixed key", () => {
        expect(mockRedisServiceSet).toHaveBeenCalledWith("atlas-key", { one: "two" });
      });
      it("should call RedisService.set", () => {
        expect(mockRedisServiceSet).toHaveBeenCalledTimes(1);
      });
    });
    describe("when not valid", () => {
      let mockRedisServiceSet = null;
      beforeEach(async done => {
        // mock the RedisService.set method
        mockRedisServiceSet = jest.spyOn(RedisService, "set").mockImplementation();

        await Cache.set(null, { one: "two" });
        done();
      });
      afterEach(() => {
        jest.clearAllMocks();
      });
      it("should call RedisService.set", () => {
        expect(mockRedisServiceSet).toHaveBeenCalledTimes(0);
      });
    });
  });
  describe("#getJson", () => {
    describe("when valid", () => {
      let mockRedisServiceGet = null;
      let value = null;
      beforeEach(async done => {
        // mock the RedisService.get method to return a fixed value regardless of key
        mockRedisServiceGet = jest.spyOn(RedisService, "get").mockImplementation(() => {
          return JSON.stringify({ one: "two" });
        });

        value = await Cache.getJson("key");
        done();
      });
      afterEach(() => {
        jest.clearAllMocks();
      });
      it("should call with a prefixed key", () => {
        expect(mockRedisServiceGet).toHaveBeenCalledWith("atlas-key");
      });
      it("should call RedisService.get", () => {
        expect(mockRedisServiceGet).toHaveBeenCalledTimes(1);
      });
      it("should return the parsed json value", () => {
        expect(value).toEqual({ one: "two" });
      });
    });
    describe("when not valid", () => {
      let mockRedisServiceGet = null;
      let value = null;
      beforeEach(async done => {
        // mock the RedisService.get method to return a fixed value regardless of key
        mockRedisServiceGet = jest.spyOn(RedisService, "get").mockImplementation(() => {
          return JSON.stringify({ one: "two" });
        });

        value = await Cache.getJson(null);
        done();
      });
      afterEach(() => {
        jest.clearAllMocks();
      });
      it("should not call the underlying service", () => {
        expect(mockRedisServiceGet).toHaveBeenCalledTimes(0);
      });
      it("should return null", () => {
        expect(value).toEqual(null);
      });
    });
  });
  describe("#setJson", () => {
    describe("when valid", () => {
      let mockRedisServiceSet = null;
      beforeEach(async done => {
        // mock the RedisService.set method
        mockRedisServiceSet = jest.spyOn(RedisService, "set").mockImplementation();

        await Cache.setJson("key", { one: "two" });
        done();
      });
      afterEach(() => {
        jest.clearAllMocks();
      });
      it("should call with a prefixed key", () => {
        expect(mockRedisServiceSet).toHaveBeenCalledWith(
          "atlas-key",
          JSON.stringify({ one: "two" })
        );
      });
      it("should call RedisService.set", () => {
        expect(mockRedisServiceSet).toHaveBeenCalledTimes(1);
      });
    });
    describe("when not valid", () => {
      let mockRedisServiceSet = null;
      beforeEach(async done => {
        // mock the RedisService.set method
        mockRedisServiceSet = jest.spyOn(RedisService, "set").mockImplementation();

        await Cache.setJson(null, { one: "two" });
        done();
      });
      afterEach(() => {
        jest.clearAllMocks();
      });
      it("should call RedisService.set", () => {
        expect(mockRedisServiceSet).toHaveBeenCalledTimes(0);
      });
    });
  });
  describe("#keys", () => {
    describe("when valid", () => {
      let keys = null;
      let mockRedisServiceKeys = null;
      beforeEach(async done => {
        // mock the RedisService.set method
        mockRedisServiceKeys = jest.spyOn(RedisService, "keys").mockImplementation(() => {
          return ["atlas-one", "atlas-two"];
        });

        keys = await Cache.keys("*");
        done();
      });
      afterEach(() => {
        jest.clearAllMocks();
      });
      it("should call with a prefixed key", () => {
        expect(mockRedisServiceKeys).toHaveBeenCalledWith("*");
      });
      it("should call RedisService.keys", () => {
        expect(mockRedisServiceKeys).toHaveBeenCalledTimes(1);
      });
      it("should return matching keys", () => {
        expect(keys.length).toEqual(2);
      });
    });
  });
});

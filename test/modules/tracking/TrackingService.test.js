import axios from "axios";

import TrackingService from "../../../src/server/modules/tracking/TrackingService";

jest.mock("axios");

describe("TrackingService", () => {
  describe("#get", () => {
    describe("when invalid", () => {
      describe("when isolateId is missing", () => {
        let response = null;
        beforeEach(async done => {
          const service = new TrackingService();
          response = await service.get("5b8d19173470371d9e49811d", null);
          done();
        });
        it("should return null", done => {
          expect(response).toBe(null);
          done();
        });
      });
      describe("when throwing an exception", () => {
        let response = null;
        beforeEach(async done => {
          axios.get.mockClear().mockImplementation(() => {
            throw new Error();
          });
          const service = new TrackingService();
          response = await service.get("5b8d19173470371d9e49811d", "abcd");
          done();
        });
        it("should call get", done => {
          expect(axios.get).toHaveBeenCalledTimes(1);
          done();
        });
        it("should call the tracking API URL", done => {
          const url = axios.get.mock.calls[0][0];
          expect(url).toEqual("https://cli.mykrobe.com/samples?isolate_id=abcd");
          done();
        });
        it("should return null", done => {
          expect(response).toBe(null);
          done();
        });
      });
      describe("when no results found", () => {
        let response = null;
        beforeEach(async done => {
          axios.get.mockClear().mockImplementation(() =>
            Promise.resolve({
              data: []
            })
          );
          const service = new TrackingService();
          response = await service.get("5b8d19173470371d9e49811d", "abcd");
          done();
        });
        it("should call get", done => {
          expect(axios.get).toHaveBeenCalledTimes(1);
          done();
        });
        it("should call the tracking API URL", done => {
          const url = axios.get.mock.calls[0][0];
          expect(url).toEqual("https://cli.mykrobe.com/samples?isolate_id=abcd");
          done();
        });
        it("should return null", done => {
          expect(response).toBe(null);
          done();
        });
      });
      describe("when the returned result is not an array", () => {
        let response = null;
        beforeEach(async done => {
          axios.get.mockClear().mockImplementation(() =>
            Promise.resolve({
              data: {
                id: "457abe90-5f7d-49e6-adbd-8ea3c12c5511",
                "experiment-id": "5b8d19173470371d9e49811d"
              }
            })
          );
          const service = new TrackingService();
          response = await service.get("5b8d19173470371d9e49811d", "abcd");
          done();
        });
        it("should call get", done => {
          expect(axios.get).toHaveBeenCalledTimes(1);
          done();
        });
        it("should call the tracking API URL", done => {
          const url = axios.get.mock.calls[0][0];
          expect(url).toEqual("https://cli.mykrobe.com/samples?isolate_id=abcd");
          done();
        });
        it("should return null", done => {
          expect(response).toBe(null);
          done();
        });
      });
    });
    describe("when valid", () => {
      describe("when isolateId is provided", () => {
        let response = null;
        beforeEach(async done => {
          beforeEach(async done => {
            axios.get.mockClear().mockImplementation(() =>
              Promise.resolve({
                data: [
                  {
                    id: "457abe90-5f7d-49e6-adbd-8ea3c12c5511",
                    "experiment-id": "5b8d19173470371d9e49811d"
                  }
                ]
              })
            );
            const service = new TrackingService();
            response = await service.get("5b8d19173470371d9e49811d", "abcd");
            done();
          });

          done();
        });
        it("should call get", done => {
          expect(axios.get).toHaveBeenCalledTimes(1);
          done();
        });
        it("should call the tracking API URL", done => {
          const url = axios.get.mock.calls[0][0];
          expect(url).toEqual("https://cli.mykrobe.com/samples?isolate_id=abcd");
          done();
        });
        it("should return the trackingId", done => {
          expect(response.fetchedExperimentId).toEqual("5b8d19173470371d9e49811d");
          expect(response.fetchedTrackingId).toEqual("457abe90-5f7d-49e6-adbd-8ea3c12c5511");
          done();
        });
      });
    });
  });
  describe("#create", () => {
    describe("when invalid", () => {
      describe("when throwing an exception", () => {
        let response = null;
        beforeEach(async done => {
          axios.post.mockClear().mockImplementation(() => {
            throw new Error();
          });
          const service = new TrackingService();
          response = await service.create("5b8d19173470371d9e49811d", "abcd");
          done();
        });
        it("should call post", done => {
          expect(axios.post).toHaveBeenCalledTimes(1);
          done();
        });
        it("should call the tracking API URL", done => {
          const url = axios.post.mock.calls[0][0];
          expect(url).toEqual("https://cli.mykrobe.com/samples");
          done();
        });
        it("should return null", done => {
          expect(response).toBe(null);
          done();
        });
      });
      describe("when empty response returned", () => {
        let response = null;
        beforeEach(async done => {
          axios.post.mockClear().mockImplementation(() =>
            Promise.resolve({
              data: {}
            })
          );
          const service = new TrackingService();
          response = await service.create("5b8d19173470371d9e49811d", "abcd");
          done();
        });
        it("should call post", done => {
          expect(axios.post).toHaveBeenCalledTimes(1);
          done();
        });
        it("should call the tracking API URL", done => {
          const url = axios.post.mock.calls[0][0];
          expect(url).toEqual("https://cli.mykrobe.com/samples");
          done();
        });
        it("should return null", done => {
          expect(response).toBe(null);
          done();
        });
      });
    });
    describe("when valid", () => {
      describe("when getting a valid sampleId", () => {
        let response = null;
        beforeEach(async done => {
          beforeEach(async done => {
            axios.post.mockClear().mockImplementation(() =>
              Promise.resolve({
                data: {
                  id: "457abe90-5f7d-49e6-adbd-8ea3c12c5511"
                }
              })
            );
            const service = new TrackingService();
            response = await service.create("5b8d19173470371d9e49811d", "abcd");
            done();
          });

          done();
        });
        it("should call post", done => {
          expect(axios.post).toHaveBeenCalledTimes(1);
          done();
        });
        it("should call the tracking API URL", done => {
          const url = axios.post.mock.calls[0][0];
          expect(url).toEqual("https://cli.mykrobe.com/samples");
          done();
        });
        it("should return the trackingId", done => {
          expect(response).toEqual("457abe90-5f7d-49e6-adbd-8ea3c12c5511");
          done();
        });
      });
    });
  });
  describe("#update", () => {
    describe("when invalid", () => {
      describe("when throwing an exception", () => {
        beforeEach(async done => {
          axios.patch.mockClear().mockImplementation(() => {
            throw new Error();
          });
          const service = new TrackingService();
          await service.update("abcd", "5b8d19173470371d9e49811d");
          done();
        });
        it("should call patch", done => {
          expect(axios.patch).toHaveBeenCalledTimes(1);
          done();
        });
        it("should call the tracking API URL", done => {
          const url = axios.patch.mock.calls[0][0];
          expect(url).toEqual("https://cli.mykrobe.com/samples/abcd");
          done();
        });
      });
    });
    describe("when valid", () => {
      describe("when response returned", () => {
        beforeEach(async done => {
          axios.patch.mockClear().mockImplementation(() =>
            Promise.resolve({
              data: {}
            })
          );
          const service = new TrackingService();
          await service.update("abcd", "5b8d19173470371d9e49811d");
          done();
        });
        it("should call patch", done => {
          expect(axios.patch).toHaveBeenCalledTimes(1);
          done();
        });
        it("should call the tracking API URL", done => {
          const url = axios.patch.mock.calls[0][0];
          expect(url).toEqual("https://cli.mykrobe.com/samples/abcd");
          done();
        });
      });
    });
  });
  describe("#upsert", () => {
    describe("when invalid", () => {
      describe("when experimentId is null", () => {
        beforeEach(async done => {
          axios.get.mockClear().mockImplementation(() =>
            Promise.resolve({
              data: {}
            })
          );
          axios.post.mockClear().mockImplementation(() =>
            Promise.resolve({
              data: {}
            })
          );
          axios.patch.mockClear().mockImplementation(() =>
            Promise.resolve({
              data: {}
            })
          );
          const service = new TrackingService();
          try {
            await service.upsert(null, "5b8d19173470371d9e49811d");
          } catch (e) {}
          done();
        });
        it("should throw an exception", async done => {
          const service = new TrackingService();
          try {
            const result = await service.upsert(null, "abcd");
            fail();
          } catch (e) {
            expect(e.message).toEqual("Call to tracking service failed.  Missing experimentId");
          }
          done();
        });
        it("should not call the get tracking API", done => {
          expect(axios.get).toHaveBeenCalledTimes(0);
          done();
        });
        it("should not call the post tracking API", done => {
          expect(axios.post).toHaveBeenCalledTimes(0);
          done();
        });
        it("should not call the patch tracking API", done => {
          expect(axios.patch).toHaveBeenCalledTimes(0);
          done();
        });
      });
    });
    describe("when valid", () => {
      describe("when trackingId exists with the same experimentId", () => {
        beforeEach(async done => {
          axios.get.mockClear().mockImplementation(() =>
            Promise.resolve({
              data: [
                {
                  id: "457abe90-5f7d-49e6-adbd-8ea3c12c5511",
                  "experiment-id": "5b8d19173470371d9e49811d"
                }
              ]
            })
          );
          axios.post.mockClear().mockImplementation(() =>
            Promise.resolve({
              data: {}
            })
          );
          axios.patch.mockClear().mockImplementation(() =>
            Promise.resolve({
              data: {}
            })
          );
          const service = new TrackingService();
          await service.upsert("5b8d19173470371d9e49811d", "abcd");
          done();
        });
        it("should not call the get tracking API", done => {
          expect(axios.get).toHaveBeenCalledTimes(1);
          done();
        });
        it("should not call the post tracking API", done => {
          expect(axios.post).toHaveBeenCalledTimes(0);
          done();
        });
        it("should not call the patch tracking API", done => {
          expect(axios.patch).toHaveBeenCalledTimes(0);
          done();
        });
      });
      describe("when trackingId exists with different experimentId", () => {
        beforeEach(async done => {
          axios.get.mockClear().mockImplementation(() =>
            Promise.resolve({
              data: [
                {
                  id: "457abe90-5f7d-49e6-adbd-8ea3c12c5511",
                  "experiment-id": "a778r19173470371d9e498215"
                }
              ]
            })
          );
          axios.post.mockClear().mockImplementation(() =>
            Promise.resolve({
              data: {}
            })
          );
          axios.patch.mockClear().mockImplementation(() =>
            Promise.resolve({
              data: {}
            })
          );
          const service = new TrackingService();
          await service.upsert("5b8d19173470371d9e49811d", "abcd");
          done();
        });
        it("should not call the get tracking API", done => {
          expect(axios.get).toHaveBeenCalledTimes(1);
          done();
        });
        it("should not call the post tracking API", done => {
          expect(axios.post).toHaveBeenCalledTimes(0);
          done();
        });
        it("should call the patch tracking API", done => {
          expect(axios.patch).toHaveBeenCalledTimes(1);
          done();
        });
      });
      describe("when trackingId does not exist", () => {
        beforeEach(async done => {
          axios.get.mockClear().mockImplementation(() =>
            Promise.resolve({
              data: []
            })
          );
          axios.post.mockClear().mockImplementation(() =>
            Promise.resolve({
              data: {}
            })
          );
          axios.patch.mockClear().mockImplementation(() =>
            Promise.resolve({
              data: {}
            })
          );
          const service = new TrackingService();
          await service.upsert("5b8d19173470371d9e49811d", "abcd");
          done();
        });
        it("should not call the get tracking API", done => {
          expect(axios.get).toHaveBeenCalledTimes(1);
          done();
        });
        it("should call the post tracking API", done => {
          expect(axios.post).toHaveBeenCalledTimes(1);
          done();
        });
        it("should not call the patch tracking API", done => {
          expect(axios.patch).toHaveBeenCalledTimes(0);
          done();
        });
      });
    });
  });
});

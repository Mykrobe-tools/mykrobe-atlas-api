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
});

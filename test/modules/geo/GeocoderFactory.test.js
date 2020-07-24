import GeocoderFactory from "../../../src/server/modules/geo/GeocoderFactory";
import GoogleGeocoder from "../../../src/server/modules/geo/GoogleGeocoder";
import LocationIQGeocoder from "../../../src/server/modules/geo/LocationIQGeocoder";

describe("GeocoderFactory", () => {
  describe("#getOptions", () => {
    describe("when Google", () => {
      let options = null;
      beforeEach(() => {
        const config = {
          google: {
            apiKey: "google-apikey"
          }
        };
        options = GeocoderFactory.getOptions(config);
      });
      it("should set the provider to google", () => {
        expect(options.provider).toEqual("google");
      });
      it("should set the locationiq apikey", () => {
        expect(options.apiKey).toEqual("google-apikey");
      });
    });
    describe("when LocationIQ", () => {
      let options = null;
      beforeEach(() => {
        const config = {
          locationIq: {
            apiKey: "locationiq-apikey"
          }
        };
        options = GeocoderFactory.getOptions(config);
      });
      it("should set the provider to locationiq", () => {
        expect(options.provider).toEqual("locationiq");
      });
      it("should set the locationiq apikey", () => {
        expect(options.apiKey).toEqual("locationiq-apikey");
      });
    });
  });
  describe("#getGeocoder", () => {
    describe("when Google", () => {
      let geocoder = null;
      beforeEach(() => {
        const config = {
          google: {
            apiKey: "google-apikey"
          }
        };
        geocoder = GeocoderFactory.getGeocoder(config);
      });
      it("should return a Google geocoder", () => {
        expect(geocoder instanceof GoogleGeocoder).toEqual(true);
      });
    });
    describe("when LocationIQ", () => {
      let geocoder = null;
      beforeEach(() => {
        const config = {
          locationIq: {
            apiKey: "locationiq-apikey"
          }
        };
        geocoder = GeocoderFactory.getGeocoder(config);
      });
      it("should return a LocationIQ geocoder", () => {
        expect(geocoder instanceof LocationIQGeocoder).toEqual(true);
      });
    });
  });
});

import GoogleGeocoder from "../../../src/server/modules/geo/GoogleGeocoder";

describe("GoogleGeocoder", () => {
  describe("#geocode", () => {
    describe("when options are valid", () => {
      describe("when address is an object", () => {
        let matches = null;
        beforeEach(async done => {
          const location = {
            countryCode: "UK",
            city: "Birmingham"
          };
          const geocoder = new GoogleGeocoder({
            provider: "google",
            apiKey: "mocked-in-__mocks__/node-geocoder"
          });
          matches = await geocoder.search(location);
          done();
        });
        it("should return matches", () => {
          expect(matches.length > 0).toEqual(true);
        });
      });
    });
    describe("when options are not valid", () => {
      let matches = null;
      beforeEach(async done => {
        const location = {};
        const geocoder = new GoogleGeocoder({
          provider: "google",
          apiKey: "mocked-in-__mocks__/node-geocoder"
        });
        matches = await geocoder.search(location);
        done();
      });
      it("should return null", () => {
        expect(matches).toBe(null);
      });
    });
  });
  describe("#getCoordinates", () => {
    describe("when matches are valid", () => {
      it("should return latitude and longitude", () => {
        const geocoder = new GoogleGeocoder({
          provider: "google",
          apiKey: "mocked-in-__mocks__/node-geocoder"
        });
        const coordinates = geocoder.getCoordinates(
          {
            city: "Birmingham",
            countryCode: "UK"
          },
          [
            {
              formattedAddress: "Birmingham, UK",
              latitude: 52.48624299999999,
              longitude: -1.890401,
              extra: {
                googlePlaceId: "ChIJc3FBGy2UcEgRmHnurvD-gco",
                confidence: 0.5,
                premise: null,
                subpremise: null,
                neighborhood: "Birmingham",
                establishment: null
              },
              administrativeLevels: {
                level2long: "West Midlands",
                level2short: "West Midlands",
                level1long: "England",
                level1short: "England"
              },
              city: "Birmingham",
              country: "United Kingdom",
              countryCode: "GB",
              provider: "google"
            }
          ]
        );
        expect(coordinates.latitude).toBeCloseTo(52.4862);
        expect(coordinates.longitude).toBeCloseTo(-1.8904);
      });
    });
    describe("when matches are empty", () => {
      it("should return nul", () => {});
    });
  });
});

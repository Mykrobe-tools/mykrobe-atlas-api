import LocationIQGeocoder from "../../../src/server/modules/geo/LocationIQGeocoder";

describe("LocationIQGeocoder", () => {
  describe("#geocode", () => {
    describe("when options are valid", () => {
      describe("when address is an object", () => {
        let matches = null;
        beforeEach(async done => {
          const location = {
            countryCode: "UK",
            city: "Birmingham"
          };
          const geocoder = new LocationIQGeocoder({
            provider: "locationiq",
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
        const geocoder = new LocationIQGeocoder({
          provider: "locationiq",
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
        const geocoder = new LocationIQGeocoder({
          provider: "locationiq",
          apiKey: "mocked-in-__mocks__/node-geocoder"
        });
        const coordinates = geocoder.getCoordinates(
          {
            city: "Birmingham",
            countryCode: "UK"
          },
          [
            {
              latitude: 52.4796992,
              longitude: -1.9026911,
              country: "United Kingdom",
              city: "Birmingham",
              state: "England",
              zipcode: undefined,
              streetName: undefined,
              streetNumber: undefined,
              countryCode: "GB",
              provider: "locationiq"
            }
          ]
        );
        expect(coordinates.latitude).toBeCloseTo(52.4796);
        expect(coordinates.longitude).toBeCloseTo(-1.9026);
      });
    });
    describe("when matches are empty", () => {
      it("should return nul", () => {});
    });
  });
});

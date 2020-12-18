import Geocoder from "../../../src/server/modules/geo/Geocoder";

describe("Geocoder()", () => {
  describe("#isValidAddress", () => {
    describe("when invalid", () => {
      describe("when null", () => {
        it("should return false", done => {
          expect(new Geocoder().isValidAddress(null)).toEqual(false);
          done();
        });
      });
      describe("when empty string", () => {
        it("should return false", done => {
          expect(new Geocoder().isValidAddress("")).toEqual(false);
          done();
        });
      });
      describe("when empty object", () => {
        it("should return false", done => {
          expect(new Geocoder().isValidAddress({})).toEqual(false);
          done();
        });
      });
      describe("when object with correct structure but empty values", () => {
        it("should return false", done => {
          expect(new Geocoder().isValidAddress({ city: "", countryCode: "" })).toEqual(false);
          done();
        });
      });
      describe("when object with correct structure but empty partial values", () => {
        it("should return false", done => {
          expect(new Geocoder().isValidAddress({ city: "" })).toEqual(false);
          done();
        });
      });
      describe("when undefined", () => {
        it("should return false", done => {
          expect(new Geocoder().isValidAddress(undefined)).toEqual(false);
          done();
        });
      });
    });
    describe("when valid", () => {
      describe("when a string address", () => {
        it("should return true", () => {
          expect(new Geocoder().isValidAddress("Birmingham, UK")).toEqual(true);
        });
      });
      describe("when an object with country", () => {
        it("should return true", () => {
          expect(new Geocoder().isValidAddress({ country: "United Kingdom" })).toEqual(true);
        });
      });
      describe("when an object with countryCode", () => {
        it("should return true", () => {
          expect(new Geocoder().isValidAddress({ countryCode: "UK" })).toEqual(true);
        });
      });
      describe("when an object with countryCode and city", () => {
        it("should return true", () => {
          expect(new Geocoder().isValidAddress({ countryCode: "UK", city: "Birmingham" })).toEqual(
            true
          );
        });
      });
      describe("when an object with city", () => {
        it("should return true", () => {
          expect(new Geocoder().isValidAddress({ city: "Birmingham" })).toEqual(true);
        });
      });
    });
  });
  describe("#getCoordinates", () => {
    describe("when matches are valid", () => {
      it("should return latitude and longitude", () => {
        const coordinates = new Geocoder().getCoordinates(
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
      it("should return latitude and longitude", () => {
        const coordinates = new Geocoder().getCoordinates(
          {
            city: "Birmingham",
            countryCode: "UK"
          },
          null
        );
        expect(coordinates).toBeFalsy();
      });
    });
  });
});

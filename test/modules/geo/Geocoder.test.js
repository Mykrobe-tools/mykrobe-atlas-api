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
});

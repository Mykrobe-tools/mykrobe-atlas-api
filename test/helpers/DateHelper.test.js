import DateHelper from "../../src/server/helpers/DateHelper";

describe("DateHelper", () => {
  describe("#createValidDateFromString", () => {
    describe("when valid", () => {
      describe("when passing a year only", () => {
        it("should return a date with begining of the year", () => {
          const date = DateHelper.createValidDateFromString("2019", "SAMEA3367307", []);
          expect(date).toEqual("2019-01-01");
        });
      });
      describe("when passing a year/year", () => {
        it("should return a date with begining of the second year", () => {
          const date = DateHelper.createValidDateFromString("1800/2014", "SAMEA3367307", []);
          expect(date).toEqual("2014-01-01");
        });
      });
      describe("when passing a year-month", () => {
        it("should return a date with begining of the month", () => {
          const date = DateHelper.createValidDateFromString("1994-05", "SAMEA3367307", []);
          expect(date).toEqual("1994-05-01");
        });
      });
      describe("when passing a year-month-day", () => {
        it("should return the same date", () => {
          const date = DateHelper.createValidDateFromString("1994-05-18", "SAMEA3367307", []);
          expect(date).toEqual("1994-05-18");
        });
        it("should return null", () => {
          const date = DateHelper.createValidDateFromString("2012-01-46", "SAMEA3367307", []);
          expect(date).toBe(null);
        });
      });
      describe("when passing a day-mmm-year", () => {
        it("should return the same date", () => {
          const date = DateHelper.createValidDateFromString("16-Jan-2009", "SAMEA3367307", []);
          expect(date).toEqual("2009-01-16");
        });
      });
      describe("when passing a mmm-year", () => {
        it("should return the same date", () => {
          const date = DateHelper.createValidDateFromString("Nov-2013", "SAMEA3367307", []);
          expect(date).toEqual("2013-11-01");
        });
        it("should return a valid date", () => {
          const date = DateHelper.createValidDateFromString("Jan-1998", "SAMEA3367307", []);
          expect(date).toEqual("1998-01-01");
        });
      });
      describe("when passing a full month-year", () => {
        it("should return the same date", () => {
          const date = DateHelper.createValidDateFromString("July-1999", "SAMEA3367307", []);
          expect(date).toEqual("1999-07-01");
        });
      });
      describe("when passing year/mm/dd", () => {
        it("should return the same date", () => {
          const date = DateHelper.createValidDateFromString("2007/04/02", "SAMEA3367307", []);
          expect(date).toEqual("2007-04-02");
        });
      });
      describe("when passing a full date", () => {
        it("should return the same date", () => {
          const date = DateHelper.createValidDateFromString("02-December-2012", "SAMEA3367307", []);
          expect(date).toEqual("2012-12-02");
        });
      });
      describe("when passing invalid values", () => {
        it("should return null for unknown", () => {
          const date = DateHelper.createValidDateFromString("unknown", "SAMEA3367307", []);
          expect(date).toBe(null);
        });
        it("should return null for None", () => {
          const date = DateHelper.createValidDateFromString("None", "SAMEA3367307", []);
          expect(date).toBe(null);
        });
        it("should return null for Blank", () => {
          const date = DateHelper.createValidDateFromString("", "SAMEA3367307", []);
          expect(date).toBe(null);
        });
      });
      describe("when passing invalid dates", () => {
        it("should map it and raise a warning", () => {
          const date = DateHelper.createValidDateFromString("February 26, 207", "SAMEA3367307", []);
          expect(date).toEqual("2007-02-26");
        });
      });
    });
  });
});

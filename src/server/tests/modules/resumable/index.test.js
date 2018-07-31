import { filenameSort } from "../../../modules/resumable";

describe("Resumable", () => {
  describe("#filenameDiff", () => {
    it("should sort an array of filenames", () => {
      const filenames = [
        "resumable-452248119-RIF_monoresistantfastqgz.1",
        "resumable-452248119-RIF_monoresistantfastqgz.5",
        "resumable-452248119-RIF_monoresistantfastqgz.4",
        "resumable-452248119-RIF_monoresistantfastqgz.2",
        "resumable-452248119-RIF_monoresistantfastqgz.3",
        "resumable-452248119-RIF_monoresistantfastqgz.6"
      ];
      const sorted = filenames.sort(filenameSort);
      expect(sorted).toEqual([
        "resumable-452248119-RIF_monoresistantfastqgz.1",
        "resumable-452248119-RIF_monoresistantfastqgz.2",
        "resumable-452248119-RIF_monoresistantfastqgz.3",
        "resumable-452248119-RIF_monoresistantfastqgz.4",
        "resumable-452248119-RIF_monoresistantfastqgz.5",
        "resumable-452248119-RIF_monoresistantfastqgz.6"
      ]);
    });
    it("should sort an array of filenames using position", () => {
      const filenames = [
        "resumable-452248119-RIF_monoresistantfastqgz.89",
        "resumable-452248119-RIF_monoresistantfastqgz.9",
        "resumable-452248119-RIF_monoresistantfastqgz.90",
        "resumable-452248119-RIF_monoresistantfastqgz.91",
        "resumable-452248119-RIF_monoresistantfastqgz.92",
        "resumable-452248119-RIF_monoresistantfastqgz.93"
      ];
      const sorted = filenames.sort(filenameSort);
      expect(sorted).toEqual([
        "resumable-452248119-RIF_monoresistantfastqgz.9",
        "resumable-452248119-RIF_monoresistantfastqgz.89",
        "resumable-452248119-RIF_monoresistantfastqgz.90",
        "resumable-452248119-RIF_monoresistantfastqgz.91",
        "resumable-452248119-RIF_monoresistantfastqgz.92",
        "resumable-452248119-RIF_monoresistantfastqgz.93"
      ]);
    });
    it("should move nulls to the beginning", () => {
      const filenames = [
        "resumable-452248119-RIF_monoresistantfastqgz.89",
        null,
        "resumable-452248119-RIF_monoresistantfastqgz.90",
        "resumable-452248119-RIF_monoresistantfastqgz.91",
        "resumable-452248119-RIF_monoresistantfastqgz.92",
        "resumable-452248119-RIF_monoresistantfastqgz.93"
      ];
      const sorted = filenames.sort(filenameSort);
      expect(sorted).toEqual([
        null,
        "resumable-452248119-RIF_monoresistantfastqgz.89",
        "resumable-452248119-RIF_monoresistantfastqgz.90",
        "resumable-452248119-RIF_monoresistantfastqgz.91",
        "resumable-452248119-RIF_monoresistantfastqgz.92",
        "resumable-452248119-RIF_monoresistantfastqgz.93"
      ]);
    });
    it("should handle non-part filenames", () => {
      const filenames = [
        "resumable-452248119-RIF_monoresistantfastqgz.89",
        "resumable-452248119-RIF_monoresistantfastqgz.9",
        "resumable-452248119-RIF_monoresistantfastqgz",
        "resumable-452248119-RIF_monoresistantfastqgz.91",
        "resumable-452248119-RIF_monoresistantfastqgz.92",
        "resumable-452248119-RIF_monoresistantfastqgz.93"
      ];
      const sorted = filenames.sort(filenameSort);
      expect(sorted).toEqual([
        "resumable-452248119-RIF_monoresistantfastqgz",
        "resumable-452248119-RIF_monoresistantfastqgz.9",
        "resumable-452248119-RIF_monoresistantfastqgz.89",
        "resumable-452248119-RIF_monoresistantfastqgz.91",
        "resumable-452248119-RIF_monoresistantfastqgz.92",
        "resumable-452248119-RIF_monoresistantfastqgz.93"
      ]);
    });
    it("should handle alphanumeric non-part filenames", () => {
      const filenames = [
        "resumable-452248119-RIF_monoresistantfastqgz.89",
        "resumable-452248119-RIF_monoresistantfastqgz.9",
        "resumable-452248119-RIF_monoresistantfastqgz",
        "resumable-452248119-RIF_monoresistantfastqgz.a",
        "resumable-452248119-RIF_monoresistantfastqgz.92",
        "resumable-452248119-RIF_monoresistantfastqgz.b"
      ];
      const sorted = filenames.sort(filenameSort);
      expect(sorted).toEqual([
        "resumable-452248119-RIF_monoresistantfastqgz",
        "resumable-452248119-RIF_monoresistantfastqgz.9",
        "resumable-452248119-RIF_monoresistantfastqgz.89",
        "resumable-452248119-RIF_monoresistantfastqgz.92",
        "resumable-452248119-RIF_monoresistantfastqgz.a",
        "resumable-452248119-RIF_monoresistantfastqgz.b"
      ]);
    });
  });
});

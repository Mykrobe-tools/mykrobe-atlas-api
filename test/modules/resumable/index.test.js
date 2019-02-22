import fs from "fs";
import path from "path";
import spawn from "await-spawn";
import rmfr from "rmfr";
import {
  filenameSort,
  reassembleChunksToFile
} from "../../../modules/resumable";

describe("Resumable", () => {
  describe("#filenameSort", () => {
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

  describe("#reassembleChunksToFile", async () => {
    it.skip(
      "should reassemble a complete file",
      async () => {
        const directory = path.resolve(
          __dirname,
          "../../fixtures/files/parts/"
        );
        const reassemblePath = path.resolve(
          directory,
          "RIF_monoresistantfast.q.gz"
        );

        const savedPath = await reassembleChunksToFile(
          directory,
          reassemblePath,
          false
        );

        const checksumResponse = await spawn("md5", [savedPath]);
        const checksum = checksumResponse.toString().trim();

        expect(checksum).toEqual(
          `MD5 (${savedPath}) = 6a5d8ad9ff173f02d773de59da23669e`
        );
        console.log(checksum);
        await rmfr(savedPath);

        // rm ~/makeandship/mykrobe-atlas-api/src/server/tests/fixtures/files/parts/RIF_monoresistantfast.q.gz
      },
      20000
    );
  });
});

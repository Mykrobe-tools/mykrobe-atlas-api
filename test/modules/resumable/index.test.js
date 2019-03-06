import fs from "fs";
import path from "path";
import spawn from "await-spawn";
import rmfr from "rmfr";
import { filenameSort, reassembleChunksToFile } from "../../../src/server/modules/resumable";

describe("Resumable", () => {
  describe("#filenameSort", () => {
    describe("when filenames are all single digit positions", () => {
      it("should order parts by ascending position number", () => {
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
    });
    describe("when filenames are a mixture of single digit and double-digit positions", () => {
      it("sshould order parts by ascending position number", () => {
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
    });
    describe("when filenames contain nulls", () => {
      it("should move sort to the beginning", () => {
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
    });
    describe("when filenames are a mixture of positions and non-positions", () => {
      it("should should sort non positions at the beginning", () => {
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
    });
    describe("when filenames contain alpha positions", () => {
      it("should sort alpha strings to the end", () => {
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

  describe("#reassembleChunksToFile", async () => {
    it("should reassemble a complete file", async () => {
      const directory = path.resolve(__dirname, "../../fixtures/files/parts/");
      const reassemblePath = path.resolve(directory, "RIF_monoresistantfast.q.gz");

      const savedPath = await reassembleChunksToFile(directory, reassemblePath, false);

      const checksumResponse = await spawn("md5", [savedPath]);
      const checksum = checksumResponse.toString().trim();

      expect(checksum).toEqual(`MD5 (${savedPath}) = 6a5d8ad9ff173f02d773de59da23669e`);
      console.log(checksum);
      await rmfr(savedPath);

      // rm ~/makeandship/mykrobe-atlas-api/src/server/tests/fixtures/files/parts/RIF_monoresistantfast.q.gz
    }, 20000);
  });
});

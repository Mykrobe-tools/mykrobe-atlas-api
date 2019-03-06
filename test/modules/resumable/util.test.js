import fs from "fs";
import path from "path";
import spawn from "await-spawn";
import rmfr from "rmfr";
import {
  initialise,
  validateRequest,
  validateChecksum,
  isUploadComplete,
  setComplete,
  setUploadDirectory,
  getChunkFilename
} from "../../../src/server/modules/resumable/util";
import uploads from "../../fixtures/uploads";

describe("Util", () => {
  describe("#initialise", () => {
    beforeEach(async done => {
      const directory = path.resolve(__dirname, "../../tmp");
      await setUploadDirectory(directory);

      done();
    });
    describe("when initalising with valid data", () => {
      describe("when there is a single chunk", () => {
        it("should initialise attributes", () => {
          const fields = uploads.valid.singleChunk;
          const result = initialise(fields);

          expect(result).toHaveProperty("identifier", "251726-333-08json");
          expect(result).toHaveProperty("chunkNumber", 1);
          expect(result).toHaveProperty("totalChunks", 1);
          expect(result).toHaveProperty("chunkSize", 1048576);
          expect(result).toHaveProperty("totalSize", 251726);
          expect(result).toHaveProperty("filename", "333-08.json");
          expect(result).toHaveProperty("originalFilename", "");
          expect(result).toHaveProperty("type", "application/json");
          expect(result).toHaveProperty("checksum", "4f36e4cbfc9dfc37559e13bd3a309d55");
        });
        it("should generate a filename", () => {
          const fields = uploads.valid.singleChunk;
          const result = initialise(fields);

          expect(result).toHaveProperty("chunkFilename");
          expect(result.chunkFilename).toMatch(/test\/tmp\/resumable-251726-333-08json.1/);
        });
        it("should set a the number of verified chunks", () => {
          const fields = uploads.valid.singleChunk;
          const result = initialise(fields);

          expect(result).toHaveProperty("verifiedTotalChunks", 1);
        });
        it("should set a percentage complete", () => {
          const fields = uploads.valid.singleChunk;
          const result = initialise(fields);

          expect(result).toHaveProperty("percentageComplete", 100);
        });
        it("should should initialise complete to false", () => {
          const fields = uploads.valid.singleChunk;
          const result = initialise(fields);

          expect(result).toHaveProperty("complete", false);
        });
      });
      describe("when there are multiple chunks", () => {
        it("should initialise attributes", () => {
          const fields = uploads.valid.multipleChunksChunk;
          const result = initialise(fields);

          expect(result).toHaveProperty("identifier", "7871146-333-08json");
          expect(result).toHaveProperty("chunkNumber", 1);
          expect(result).toHaveProperty("totalChunks", 7);
          expect(result).toHaveProperty("chunkSize", 1048576);
          expect(result).toHaveProperty("totalSize", 7871146);
          expect(result).toHaveProperty("filename", "333-08.json");
          expect(result).toHaveProperty("originalFilename", "");
          expect(result).toHaveProperty("type", "application/json");
          expect(result).toHaveProperty("checksum", "4f36e4cbfc9dfc37559e13bd3a309d55");
          expect(result).toHaveProperty("chunkFilename");
          expect(result.chunkFilename).toMatch(/test\/tmp\/resumable-7871146-333-08json.1/);
          expect(result).toHaveProperty("complete", false);
        });
        it("should generate a filename", () => {
          const fields = uploads.valid.multipleChunksChunk;
          const result = initialise(fields);

          expect(result).toHaveProperty("chunkFilename");
          expect(result.chunkFilename).toMatch(/test\/tmp\/resumable-7871146-333-08json.1/);
        });
        it("should set a the number of verified chunks", () => {
          const fields = uploads.valid.multipleChunksChunk;
          const result = initialise(fields);

          expect(result).toHaveProperty("verifiedTotalChunks", 7);
        });
        it("should set a percentage complete", () => {
          const fields = uploads.valid.multipleChunksChunk;
          const result = initialise(fields);

          expect(result).toHaveProperty("percentageComplete", (1 / 7) * 100);
        });
        it("should initialise complete as false", () => {
          const fields = uploads.valid.multipleChunksChunk;
          const result = initialise(fields);

          expect(result).toHaveProperty("complete", false);
        });
      });
    });
    describe("when initialising with invalid data", () => {
      describe("when the identifier has invalid characters", () => {
        it("should clean the identifier", () => {
          const fields = uploads.valid.singleChunkIdentifierNeedsCleaning;
          const result = initialise(fields);

          expect(result).toHaveProperty("identifier", "25172633308json");
        });
        it("should use the cleaned identifier in chunk filename", () => {
          const fields = uploads.valid.singleChunkIdentifierNeedsCleaning;
          const result = initialise(fields);

          expect(result).toHaveProperty("chunkFilename");
          expect(result.chunkFilename).toMatch(/25172633308json/);
        });
      });
    });
  });
  describe("#validateRequest", () => {
    describe("when the resumable file is valid", () => {
      it("should return as valid", () => {
        const fields = uploads.valid.multipleChunksChunk;
        const initialised = initialise(fields);
        const valid = validateRequest(initialised);

        expect(valid).toHaveProperty("valid", true);
      });
    });
    describe("when the resumable file is invalid", () => {
      describe("with a missing chunk number", () => {
        it("should return as invalid with an error", () => {
          const fields = uploads.invalid.missingChunkNumber;
          const initialised = initialise(fields);
          const valid = validateRequest(initialised);

          expect(valid).toHaveProperty("valid", false);
          expect(valid).toHaveProperty("message", "Non-resumable request");
        });
      });
      describe("with a zero chunk number", () => {
        it("should return as invalid with an error", () => {
          const fields = uploads.invalid.zeroChunkNumber;
          const initialised = initialise(fields);
          const valid = validateRequest(initialised);

          expect(valid).toHaveProperty("valid", false);
          expect(valid).toHaveProperty("message", "Non-resumable request");
        });
      });
      describe("with a missing chunk size", () => {
        it("should return as invalid with an error", () => {
          const fields = uploads.invalid.missingChunkSize;
          const initialised = initialise(fields);
          const valid = validateRequest(initialised);

          expect(valid).toHaveProperty("valid", false);
          expect(valid).toHaveProperty("message", "Non-resumable request");
        });
      });
      describe("with a zero chunk size", () => {
        it("should return as invalid with an error", () => {
          const fields = uploads.invalid.zeroChunkSize;
          const initialised = initialise(fields);
          const valid = validateRequest(initialised);

          expect(valid).toHaveProperty("valid", false);
          expect(valid).toHaveProperty("message", "Non-resumable request");
        });
      });
      describe("with a missing total size", () => {
        it("should return as invalid with an error", () => {
          const fields = uploads.invalid.missingTotalSize;
          const initialised = initialise(fields);
          const valid = validateRequest(initialised);

          expect(valid).toHaveProperty("valid", false);
          expect(valid).toHaveProperty("message", "Non-resumable request");
        });
      });
      describe("with a zero total size", () => {
        it("should return as invalid with an error", () => {
          const fields = uploads.invalid.zeroTotalSize;
          const initialised = initialise(fields);
          const valid = validateRequest(initialised);

          expect(valid).toHaveProperty("valid", false);
          expect(valid).toHaveProperty("message", "Non-resumable request");
        });
      });
      describe("with a missing identifier", () => {
        it("should return as invalid with an error", () => {
          const fields = uploads.invalid.missingIdentifier;
          const initialised = initialise(fields);
          const valid = validateRequest(initialised);

          expect(valid).toHaveProperty("valid", false);
          expect(valid).toHaveProperty("message", "Non-resumable request");
        });
      });
      describe("with an empty identifier", () => {
        it("should return as invalid with an error", () => {
          const fields = uploads.invalid.emptyIdentifier;
          const initialised = initialise(fields);
          const valid = validateRequest(initialised);

          expect(valid).toHaveProperty("valid", false);
          expect(valid).toHaveProperty("message", "Non-resumable request");
        });
      });
      describe("with a missing filename", () => {
        it("should return as invalid with an error", () => {
          const fields = uploads.invalid.missingFilename;
          const initialised = initialise(fields);
          const valid = validateRequest(initialised);

          expect(valid).toHaveProperty("valid", false);
          expect(valid).toHaveProperty("message", "Non-resumable request");
        });
      });
      describe("with an empty filename", () => {
        it("should return as invalid with an error", () => {
          const fields = uploads.invalid.emptyFilename;
          const initialised = initialise(fields);
          const valid = validateRequest(initialised);

          expect(valid).toHaveProperty("valid", false);
          expect(valid).toHaveProperty("message", "Non-resumable request");
        });
      });
      describe("with a larger chunk number than chunks exist", () => {
        it("should return as invalid with an error", () => {
          const fields = uploads.invalid.chunkNumberTooLarge;
          const initialised = initialise(fields);
          const valid = validateRequest(initialised);

          expect(valid).toHaveProperty("valid", false);
          expect(valid).toHaveProperty("message", "Incorrect chunk number");
        });
      });
      describe("with a larger file size than the max allowed", () => {
        it("should return as invalid with an error", () => {
          const fields = uploads.invalid.fileSizeTooLarge;
          const initialised = initialise(fields);
          const valid = validateRequest(initialised);

          expect(valid).toHaveProperty("valid", false);
          expect(valid).toHaveProperty("message", "File is larger than max file size");
        });
      });
      describe("with a different file size", () => {
        describe("for the chunk", () => {
          it("should return as invalid with an error", () => {
            const fields = uploads.valid.multipleChunksChunk;
            const initialised = initialise(fields);
            const valid = validateRequest(initialised, 200000);

            expect(valid).toHaveProperty("valid", false);
            expect(valid).toHaveProperty("message", "Incorrect chunk size");
          });
        });
        describe("for a single chunk", () => {
          it("should return as invalid with an error", () => {
            const fields = uploads.valid.singleChunk;
            const initialised = initialise(fields);
            const valid = validateRequest(initialised, 200000);

            expect(valid).toHaveProperty("valid", false);
            expect(valid).toHaveProperty("message", "Incorrect individual chunk size");
          });
        });
        describe("for the final chunk", () => {
          it("should return as invalid with an error", () => {
            const fields = uploads.valid.multipleChunksFinalChunk;
            const initialised = initialise(fields);
            const valid = validateRequest(initialised, 200000);

            expect(valid).toHaveProperty("valid", false);
            expect(valid).toHaveProperty("message", "Incorrect final chunk size");
          });
        });
      });
    });
  });
  describe("#validateChecksum", () => {
    describe("when the file exists", () => {
      describe("when the checksum matches", () => {
        it("should be valid", () => {
          const directory = path.resolve(__dirname, "../../fixtures/files");
          const filepath = path.join(directory, "lipsum.txt");

          const valid = validateChecksum(filepath, "ffb8f2cb3493f035fe5a0107ea1e3db4");
          expect(valid).toEqual(true);
        });
      });
      describe("when the checksum does not match", () => {
        it("should be invalid", () => {
          const directory = path.resolve(__dirname, "../../fixtures/files");
          const filepath = path.join(directory, "lipsum.txt");

          const valid = validateChecksum(filepath, "ffb8f2cb3493f035fe5a0107ea1e3d");
          expect(valid).toEqual(false);
        });
      });
    });
    describe("when the file does not exist", () => {
      it("should be invalid", () => {
        const directory = path.resolve(__dirname, "../../fixtures/files");
        const filepath = path.join(directory, "nofile.txt");

        const valid = validateChecksum(filepath, "ffb8f2cb3493f035fe5a0107ea1e3db4");
        expect(valid).toEqual(false);
      });
    });
  });
  describe("#isUploadComplete", () => {
    describe("with valid data", () => {
      describe("when there is a single chunk", () => {
        describe("when the upload is complete", () => {
          beforeEach(async done => {
            const directory = path.resolve(__dirname, "../../fixtures/files/parts");
            await setUploadDirectory(directory);

            done();
          });
          it("should return true", () => {
            const valid = isUploadComplete(1, "single-lipsum.txt");
            expect(valid).toEqual(true);
          });
        });
      });
      describe("when there are multiple chunks", () => {
        describe("when the upload is complete", () => {
          it("should return true", () => {
            const valid = isUploadComplete(2, "multiple-lipsum.txt");
            expect(valid).toEqual(true);
          });
        });
        describe("when the upload is not complete", () => {
          it("should return false", () => {
            const valid = isUploadComplete(3, "multiple-lipsum.txt");
            expect(valid).toEqual(false);
          });
        });
      });
    });
  });
  describe("#setComplete", () => {
    describe("with valid data", () => {
      beforeEach(async done => {
        const directory = path.resolve(__dirname, "../../fixtures/files/parts");
        await setUploadDirectory(directory);

        done();
      });
      describe("when there is a single chunk", () => {
        describe("when the upload is complete", () => {
          it("should return true", () => {
            const fields = uploads.valid.singleChunkWithFilePart;
            const status = initialise(fields);

            setComplete(status);

            expect(status).toHaveProperty("complete", true);
          });
        });
      });
      describe("when there are multiple chunks", () => {
        describe("when the upload is complete", () => {
          it("should return true", () => {
            const fields = uploads.valid.multipleChunksChunkWithAllFileParts;
            const status = initialise(fields);

            const valid = isUploadComplete(2, "multiple-lipsum.txt");
            expect(valid).toEqual(true);
          });
        });
        describe("when the upload is not complete", () => {
          it("should return false", () => {
            const fields = uploads.valid.multipleChunksChunkWithSomeFileParts;
            const status = initialise(fields);

            const valid = isUploadComplete(3, "multiple-lipsum.txt");
            expect(valid).toEqual(false);
          });
        });
      });
    });
  });
  describe("#setUploadDirectory", () => {});
  describe("#getChunkFilename", () => {});
});

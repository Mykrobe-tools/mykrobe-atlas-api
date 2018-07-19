import fs from "fs";
import path from "path";
import crypto from "crypto";
import mkdirp from "mkdirp-promise";
import config from "../../../config/env";

const maxFileSize = config.express.uploadMaxFileSize;
let uploadDirectory;

// set local upload directory
const setUploadDirectory = uploadDir => {
  uploadDirectory = uploadDir;
  return mkdirp(uploadDirectory);
};

const initFields = fields => {
  const identifier = cleanIdentifier(fields.resumableIdentifier);
  return {
    chunkNumber: fields.resumableChunkNumber,
    chunkSize: parseInt(fields.resumableChunkSize, 10),
    totalSize: parseInt(fields.resumableTotalSize, 10),
    identifier,
    filename: fields.resumableFilename,
    originalFilename: fields.resumableIdentifier,
    checksum: fields.checksum,
    chunkFilename: getChunkFilename(fields.resumableChunkNumber, identifier)
  };
};

const cleanIdentifier = identifier => identifier.replace(/^0-9A-Za-z_-/gim, "");

const getChunkFilename = (chunkNumber, identifier) => {
  identifier = cleanIdentifier(identifier);
  return path.join(uploadDirectory, `./resumable-${identifier}.${chunkNumber}`);
};

const validateRequest = (
  chunkNumber,
  chunkSize,
  totalSize,
  identifier,
  filename,
  fileSize
) => {
  identifier = cleanIdentifier(identifier);
  const validation = {
    valid: true,
    message: null
  };

  // Validation: Check if the request is sane
  if (
    chunkNumber === 0 ||
    chunkSize === 0 ||
    totalSize === 0 ||
    identifier.length === 0 ||
    filename.length === 0
  ) {
    validation.valid = false;
    validation.message = "Non-resumable request";
    return validation;
  }
  // Validation: Incorrect chunk number
  const numberOfChunks = Math.max(Math.floor(totalSize / (chunkSize * 1)), 1);
  if (chunkNumber > numberOfChunks) {
    validation.valid = false;
    validation.message = "Incorrect chunk number";
    return validation;
  }
  // Validation: Is the file too big?
  if (maxFileSize && totalSize > maxFileSize) {
    validation.valid = false;
    validation.message = "File is larger than max file size";
    return validation;
  }
  if (typeof fileSize !== "undefined") {
    // Validation: The chunk in the POST request isn't the correct size
    if (chunkNumber < numberOfChunks && fileSize !== chunkSize) {
      validation.valid = false;
      validation.message = "Incorrect chunk size";
      return validation;
    }
    // Validation: The chunks in the POST is the last one, and the fil is not the correct size
    if (
      numberOfChunks > 1 &&
      chunkNumber === numberOfChunks &&
      fileSize !== totalSize % chunkSize + chunkSize
    ) {
      validation.valid = false;
      validation.message = "Incorrect final chunk size";
      return validation;
    }
    // Validation: The file is only a single chunk, and the data size does not fit
    if (numberOfChunks === 1 && fileSize !== totalSize) {
      validation.valid = false;
      validation.message = "Incorrect individual chunk size";
      return validation;
    }
  }
  return validation;
};

const validateChecksum = (filename, checksum) => {
  const fileData = fs.readFileSync(filename);
  const generatedChecksum = crypto
    .createHash("md5")
    .update(fileData)
    .digest("hex");
  return generatedChecksum === checksum;
};

const isUploadCompleted = (
  numberOfChunks,
  identifier,
  currentTestChunk = 1
) => {
  const fileName = getChunkFilename(currentTestChunk, identifier);
  const fileExists = fs.existsSync(fileName);
  if (fileExists) {
    currentTestChunk += 1;
    if (currentTestChunk > numberOfChunks) {
      return true;
    }
    return isUploadCompleted(numberOfChunks, identifier, currentTestChunk);
  }
  return false;
};

const utils = Object.freeze({
  initFields,
  validateRequest,
  validateChecksum,
  isUploadCompleted,
  setUploadDirectory,
  getChunkFilename
});

export default utils;

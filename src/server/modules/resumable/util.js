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

const initialise = fields => {
  const identifier = fields.resumableIdentifier ? cleanIdentifier(fields.resumableIdentifier) : "";
  const chunkNumber = fields.resumableChunkNumber || 0;
  const totalChunks = fields.resumableTotalChunks || 0;
  const chunkFilename = getChunkFilename(chunkNumber, identifier);
  const chunkSize = fields.resumableChunkSize ? parseInt(fields.resumableChunkSize, 10) : 0;
  const totalSize = fields.resumableTotalSize ? parseInt(fields.resumableTotalSize, 10) : 0;
  const filename = fields.resumableFilename || "";
  const originalFilename = fields.resumableOriginalFilename || "";
  const type = fields.resumableType || "";
  const checksum = fields.checksum || "";
  const status = {
    identifier,
    chunkNumber,
    totalChunks,
    chunkSize,
    totalSize,
    filename,
    originalFilename,
    type,
    checksum,
    chunkFilename,
    complete: false
  };
  setVerifiedTotalChunks(status);
  setPercentageComplete(status);

  return status;
};

const setVerifiedTotalChunks = status => {
  if (status && status.totalSize && status.chunkSize) {
    status.verifiedTotalChunks = Math.max(
      Math.floor(status.totalSize / (status.chunkSize * 1.0)),
      1
    );
  }
};

const setComplete = status => {
  if (status && status.verifiedTotalChunks && status.identifier) {
    status.complete = isUploadComplete(status.verifiedTotalChunks, status.identifier);
  }
};

const setPercentageComplete = status => {
  // percentage complete for valid number of and total chunks
  if (status && status.chunkNumber && status.totalChunks) {
    status.percentageComplete = (status.chunkNumber / status.totalChunks) * 100;
  }
};

const cleanIdentifier = identifier => identifier.replace(/[^0-9A-Za-z_-]/gim, "");

const getChunkFilename = (chunkNumber, identifier) => {
  identifier = cleanIdentifier(identifier);
  return path.join(uploadDirectory, `./resumable-${identifier}.${chunkNumber}`);
};

const validateRequest = (status, fileSize) => {
  const { chunkNumber, chunkSize, totalSize, identifier, filename } = status;

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
      fileSize !== (totalSize % chunkSize) + chunkSize
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

const isUploadComplete = (numberOfChunks, identifier, currentTestChunk = 1) => {
  const fileName = getChunkFilename(currentTestChunk, identifier);
  const fileExists = fs.existsSync(fileName);
  if (fileExists) {
    currentTestChunk += 1;
    if (currentTestChunk > numberOfChunks) {
      return true;
    }
    return isUploadComplete(numberOfChunks, identifier, currentTestChunk);
  }
  return false;
};

const utils = Object.freeze({
  initialise,
  validateRequest,
  validateChecksum,
  isUploadComplete,
  setComplete,
  setUploadDirectory,
  getChunkFilename
});

export default utils;

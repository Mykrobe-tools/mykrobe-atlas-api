import fs from "fs";
import spawn from "await-spawn";
import splitFile from "split-file";
import {
  initialise,
  validateRequest,
  validateChecksum,
  setComplete,
  setUploadDirectory,
  getChunkFilename
} from "./util";
import Experiment from "../../models/experiment.model";
import config from "../../../config/env";
import logger from "../logging/logger";

// handle get requests
const get = req => {
  logger.debug(`Resumable#get: enter`);
  const status = initialise(req.query);
  logger.debug(`Resumable#get: status: ${JSON.stringify(status)}`);

  const validation = validateRequest(status);
  logger.debug(`Resumable#get: validation: ${JSON.stringify(validation)}`);

  if (!validation.valid) {
    status.valid = validation.valid;
    status.message = validation.message;
    return status;
  }

  const chunkFilename = status.chunkFilename;
  const chunkNumber = status.chunkNumber;
  if (!fs.existsSync(chunkFilename)) {
    status.valid = false;
    status.message = `Chunk ${chunkNumber} not uploaded yet`;
    return status;
  }

  const validChecksum = validateChecksum(chunkFilename, checksum);
  if (!validChecksum) {
    status.valid = false;
    status.message = "Uploaded file checksum doesn't match original checksum";
    return status;
  }

  return status;
};

// handle post requests
const post = async req => {
  const files = req.file;
  logger.debug(`Resumable#post: files: ${JSON.stringify(files, null, 2)}`);
  const status = initialise(req.body);
  logger.debug(`Resumable#post: status: ${JSON.stringify(status, null, 2)}`);
  if (!files.size) {
    status.message = "Invalid resumable request";
    return status;
  }

  const fileSize = parseInt(files.size, 10);
  logger.debug(`Resumable#post: fileSize: ${JSON.stringify(fileSize, null, 2)}`);
  const validation = validateRequest(status, fileSize);
  if (!validation.valid) {
    status.message = validation.message;
    return status;
  }

  const path = files.path;
  logger.debug(`Resumable#post: path: ${JSON.stringify(path, null, 2)}`);
  const checksum = status.checksum;
  logger.debug(`Resumable#post: checksum: ${JSON.stringify(checksum, null, 2)}`);
  const validChecksum = validateChecksum(path, checksum);
  logger.debug(`Resumable#post: validChecksum: ${JSON.stringify(validChecksum, null, 2)}`);
  if (!validChecksum) {
    status.message = "Uploaded file checksum doesn't match original checksum";
    return status;
  }

  // save uploaded chunk to disk
  const chunkFilename = status.chunkFilename;
  logger.debug(`Resumable#post: ${files.path} => ${JSON.stringify(chunkFilename, null, 2)}`);
  await spawn("mv", [files.path, chunkFilename]);

  // detailed verification of complete - chunk by chunk
  setComplete(status);
  const chunkNumber = status.chunkNumber;
  logger.debug(`Resumable#post: chunkNumber: ${JSON.stringify(chunkNumber, null, 2)}`);
  status.message = `Chunk ${chunkNumber} uploaded`;
  logger.debug(`Resumable#post: status: ${JSON.stringify(status, null, 2)}`);
  return status;
};

const isNumber = num => {
  if (typeof num === "number") {
    return num - num === 0;
  }
  if (typeof num === "string" && num.trim() !== "") {
    return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
  }
  return false;
};

const filenameSort = (first, second) => {
  // nulls
  if (!first && !second) {
    return 0;
  }
  if (!first) {
    return -1;
  }
  if (!second) {
    return 1;
  }

  // no partial files
  if (first.indexOf(".") === -1 || second.indexOf(".") === -1) {
    return first.localeCompare(second);
  }

  // files with a part number
  const firstPosition = first.substring(first.lastIndexOf(".") + 1, first.length);
  const secondPosition = second.substring(second.lastIndexOf(".") + 1, second.length);

  if (isNumber(firstPosition) && isNumber(secondPosition)) {
    return parseInt(firstPosition) - parseInt(secondPosition);
  }

  // anything else - string comparison
  return first.localeCompare(second);
};

const reassembleChunksToFile = (directory, targetPath, filename, remove = true) => {
  const files = fs.readdirSync(directory);

  // remove hidden / unwanted files
  const key = filename.split(".").join("");
  const regex = new RegExp(`.*?(${key}).*?`);
  const filteredFiles = files.filter(item => !/(^|\/)\.[^\/\.]/g.test(item) && regex.test(item));

  // sort into a natural order i.e. file.9, file.10, file.11
  const sortedFiles = filteredFiles.sort(filenameSort);

  const parts = [];

  sortedFiles.forEach(file => {
    const partPath = `${directory}/${file}`;
    parts.push(partPath);
  });

  if (remove) {
    return splitFile.mergeFiles(parts, targetPath).then(savedPath => {
      parts.forEach(part => {
        fs.unlinkSync(part);
      });

      return savedPath;
    });
  } else {
    return splitFile.mergeFiles(parts, targetPath);
  }
};

const reassembleChunks = async (id, name, cb) => {
  const directory = `${config.express.uploadDir}/experiments/${id}/file`;
  const targetPath = `${config.express.uploadDir}/experiments/${id}/file/${name}`;

  reassembleChunksToFile(directory, targetPath, name, true);

  const foundExperiment = await Experiment.get(id);
  foundExperiment.file = name;
  await foundExperiment.save();
  cb();
};

const resumable = Object.freeze({
  post,
  setUploadDirectory,
  reassembleChunks,
  reassembleChunksToFile,
  filenameSort,
  get
});

export default resumable;

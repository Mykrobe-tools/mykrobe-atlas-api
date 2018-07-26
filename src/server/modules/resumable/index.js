import fs from "fs";
import spawn from "await-spawn";
import {
  initFields,
  validateRequest,
  validateChecksum,
  isUploadCompleted,
  setUploadDirectory,
  getChunkFilename
} from "./util";
import Experiment from "../../models/experiment.model";
import config from "../../../config/env";

// handle post requests
const post = async req => {
  const files = req.file;

  const {
    chunkNumber,
    chunkSize,
    totalSize,
    identifier,
    filename,
    originalFilename,
    checksum,
    chunkFilename
  } = initFields(req.body);

  const status = {
    complete: false,
    message: null,
    filename,
    originalFilename,
    identifier
  };

  if (!files.size) {
    status.message = "Invalid resumable request";
    return status;
  }

  const validation = validateRequest(
    chunkNumber,
    chunkSize,
    totalSize,
    identifier,
    filename,
    parseInt(files.size, 10)
  );

  if (!validation.valid) {
    status.message = validation.message;
    return status;
  }

  const validChecksum = validateChecksum(files.path, checksum);
  if (!validChecksum) {
    status.message = "Uploaded file checksum doesn't match original checksum";
    return status;
  }

  // save uploaded chunk to disk
  await spawn("mv", [files.path, chunkFilename]);

  status.message = `Chunk ${chunkNumber} uploaded`;
  const numberOfChunks = Math.max(Math.floor(totalSize / (chunkSize * 1.0)), 1);
  status.complete = isUploadCompleted(numberOfChunks, identifier);
  return status;
};

const reassembleChunks = async (id, name, cb) => {
  const files = fs.readdirSync(
    `${config.express.uploadDir}/experiments/${id}/file`
  );
  files.forEach(file => {
    const readableStream = fs.createReadStream(
      `${config.express.uploadDir}/experiments/${id}/file/${file}`
    );
    readableStream.pipe(
      fs.createWriteStream(
        `${config.express.uploadDir}/experiments/${id}/file/${name}`,
        { flags: "a" }
      )
    );
    fs.unlinkSync(`${config.express.uploadDir}/experiments/${id}/file/${file}`);
  });
  const foundExperiment = await Experiment.get(id);
  foundExperiment.file = name;
  await foundExperiment.save();
  cb();
};

// handle get requests
const get = req => {
  const chunkNumber = req.query.resumableChunkNumber || 0;
  const chunkSize = req.query.resumableChunkSize || 0;
  const totalSize = req.query.resumableTotalSize || 0;
  const identifier = req.query.resumableIdentifier || "";
  const filename = req.query.resumableFilename || "";
  const checksum = req.query.checksum || "";

  const chunkFilename = getChunkFilename(chunkNumber, identifier);

  const status = {
    valid: true,
    message: null,
    filename: chunkFilename,
    originalFilename: filename,
    identifier
  };

  const validation = validateRequest(
    chunkNumber,
    chunkSize,
    totalSize,
    identifier,
    filename
  );
  if (!validation.valid) {
    status.valid = validation.valid;
    status.message = validation.message;
    return status;
  }

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

const resumable = Object.freeze({
  post,
  setUploadDirectory,
  reassembleChunks,
  get
});

export default resumable;

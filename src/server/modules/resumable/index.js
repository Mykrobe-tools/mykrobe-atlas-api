import fs from "fs";
import spawn from "await-spawn";
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

// handle get requests
const get = req => {
  const status = initialise(req.query);

  const validation = validateRequest(status);
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
  const status = initialise(req.body);
  if (!files.size) {
    status.message = "Invalid resumable request";
    return status;
  }

  const fileSize = parseInt(files.size, 10);
  const validation = validateRequest(status, fileSize);
  if (!validation.valid) {
    status.message = validation.message;
    return status;
  }

  const path = files.path;
  const checksum = status.checksum;
  const validChecksum = validateChecksum(path, checksum);

  if (!validChecksum) {
    status.message = "Uploaded file checksum doesn't match original checksum";
    return status;
  }

  // save uploaded chunk to disk
  const chunkFilename = status.chunkFilename;
  await spawn("mv", [files.path, chunkFilename]);

  // detailed verification of complete - chunk by chunk
  setComplete(status);
  const chunkNumber = status.chunkNumber;
  status.message = `Chunk ${chunkNumber} uploaded`;

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

const resumable = Object.freeze({
  post,
  setUploadDirectory,
  reassembleChunks,
  get
});

export default resumable;

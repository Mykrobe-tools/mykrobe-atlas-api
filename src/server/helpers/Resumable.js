import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';
import crypto from 'crypto';
import Experiment from '../models/experiment.model';

const spawn = require('child_process').spawnSync;

let uploadDirectory;
const maxFileSize = null;
const config = require('../../config/env');

// set local upload directory
function setUploadDirectory(uploadDir, done) {
  uploadDirectory = uploadDir;
  mkdirp(uploadDirectory, (err) => {
    if (err) {
      return done(err);
    }
    return done();
  });
}

// handle post requests
function post(req) {
  const fields = req.body;
  const files = req.file;
  const chunkNumber = fields.resumableChunkNumber;
  const chunkSize = fields.resumableChunkSize;
  const totalSize = parseInt(fields.resumableTotalSize, 10);
  const identifier = cleanIdentifier(fields.resumableIdentifier);
  const filename = fields.resumableFilename;
  const originalFilename = fields.resumableIdentifier;
  const checksum = fields.checksum;
  const chunkFilename = getChunkFilename(chunkNumber, identifier);
  const status = {
    complete: false,
    message: null,
    filename,
    originalFilename,
    identifier
  };

  if (!files.size) {
    status.message = 'Invalid resumable request';
    return status;
  }

  const validation = validateRequest(chunkNumber,
                                     chunkSize,
                                     totalSize,
                                     identifier,
                                     filename,
                                     files.size);
  if (!validation.valid) {
    status.message = validation.message;
    return status;
  }

  const validChecksum = validateChecksum(files.path, checksum);
  if (!validChecksum) {
    status.message = 'Uploaded file checksum doesn\'t match original checksum';
    return status;
  }

  // save uploaded chunk to disk
  spawn('mv', [files.path, chunkFilename]);

  status.message = `Chunk ${chunkNumber} uploaded`;
  let currentTestChunk = 1;
  const numberOfChunks = Math.max(Math.floor(totalSize / (chunkSize * 1.0)), 1);

  function testForUploadCompletion() {
    const fileName = getChunkFilename(currentTestChunk, identifier);
    const fileExists = fs.existsSync(fileName);
    if (fileExists) {
      currentTestChunk += 1;
      if (currentTestChunk > numberOfChunks) {
        status.complete = true;
        return status;
      }
      return testForUploadCompletion();
    }
    return status;
  }
  return testForUploadCompletion();
}

function cleanIdentifier(identifier) {
  return identifier.replace(/^0-9A-Za-z_-/img, '');
}

function getChunkFilename(chunkNumber, identifier) {
  identifier = cleanIdentifier(identifier); // eslint-disable-line no-param-reassign
  return path.join(uploadDirectory, `./resumable-${identifier}.${chunkNumber}`);
}

function validateRequest(chunkNumber, chunkSize, totalSize, identifier, filename, fileSize) {
  identifier = cleanIdentifier(identifier); // eslint-disable-line no-param-reassign
  const validation = {
    valid: true,
    message: null
  };

  // Validation: Check if the request is sane
  if (chunkNumber === 0 ||
      chunkSize === 0 ||
      totalSize === 0 ||
      identifier.length === 0 ||
      filename.length === 0) {
    validation.valid = false;
    validation.message = 'Non-resumable request';
    return validation;
  }
  // Validation: Incorrect chunk number
  const numberOfChunks = Math.max(Math.floor(totalSize / (chunkSize * 1)), 1);
  if (chunkNumber > numberOfChunks) {
    validation.valid = false;
    validation.message = 'Incorrect chunk number';
    return validation;
  }
  // Validation: Is the file too big?
  if (maxFileSize && totalSize > maxFileSize) {
    validation.valid = false;
    validation.message = 'File is larger than max file size';
    return validation;
  }
  if (typeof fileSize !== 'undefined') {
    // Validation: The chunk in the POST request isn't the correct size
    if (chunkNumber < numberOfChunks && fileSize !== chunkSize) {
      validation.valid = false;
      validation.message = 'Incorrect chunk size';
      return validation;
    }
    // Validation: The chunks in the POST is the last one, and the fil is not the correct size
    if (numberOfChunks > 1 &&
        chunkNumber === numberOfChunks &&
        fileSize !== ((totalSize % chunkSize) + chunkSize)) {
      validation.valid = false;
      validation.message = 'Incorrect final chunk size';
      return validation;
    }
    // Validation: The file is only a single chunk, and the data size does not fit
    if (numberOfChunks === 1 && fileSize !== totalSize) {
      validation.valid = false;
      validation.message = 'Incorrect individual chunk size';
      return validation;
    }
  }
  return validation;
}

function validateChecksum(filename, checksum) {
  const fileData = fs.readFileSync(filename);
  const generatedChecksum = crypto.createHash('md5').update(fileData).digest('hex');
  return generatedChecksum === checksum;
}

function reassembleChunks(id, name, cb) {
  fs.readdir(`${config.uploadDir}/experiments/${id}/file`, (err, files) => {
    files.forEach((file) => {
      const readableStream = fs.createReadStream(`${config.uploadDir}/experiments/${id}/file/${file}`);
      readableStream.pipe(fs.createWriteStream(`${config.uploadDir}/experiments/${id}/file/${name}`));
      fs.unlinkSync(`${config.uploadDir}/experiments/${id}/file/${file}`);
    });
    Experiment.get(id)
      .then((foundExperiment) => {
        foundExperiment.file = name; // eslint-disable-line no-param-reassign
        foundExperiment.save()
          .then(cb);
      });
  });
}

// handle get requests
function get(req) {
  const chunkNumber = req.query.resumableChunkNumber || 0;
  const chunkSize = req.query.resumableChunkSize || 0;
  const totalSize = req.query.resumableTotalSize || 0;
  const identifier = req.query.resumableIdentifier || '';
  const filename = req.query.resumableFilename || '';
  const checksum = req.query.checksum || '';

  const chunkFilename = getChunkFilename(chunkNumber, identifier);

  const status = {
    valid: true,
    message: null,
    filename: chunkFilename,
    originalFilename: filename,
    identifier
  };

  const validation = validateRequest(chunkNumber, chunkSize, totalSize, identifier, filename);
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
    status.message = 'Uploaded file checksum doesn\'t match original checksum';
    return status;
  }

  return status;
}

export default { post, setUploadDirectory, reassembleChunks, get };

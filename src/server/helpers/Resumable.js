import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';
import crypto from 'crypto';

let uploadDirectory;
const maxFileSize = null;

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
  fs.renameSync(files.path, chunkFilename);
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

export default { post, setUploadDirectory };

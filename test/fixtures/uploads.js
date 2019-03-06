export default {
  valid: {
    singleChunk: {
      resumableChunkNumber: 1,
      resumableChunkSize: 1048576,
      resumableCurrentChunkSize: 251726,
      resumableTotalSize: 251726,
      resumableType: "application/json",
      resumableIdentifier: "251726-333-08json",
      resumableFilename: "333-08.json",
      resumableRelativePath: "333-08.json",
      resumableTotalChunks: 1,
      checksum: "4f36e4cbfc9dfc37559e13bd3a309d55"
    },
    multipleChunksChunk: {
      resumableChunkNumber: 1,
      resumableChunkSize: 1048576,
      resumableCurrentChunkSize: 1048576,
      resumableTotalSize: 7871146,
      resumableType: "application/json",
      resumableIdentifier: "7871146-333-08json",
      resumableFilename: "333-08.json",
      resumableRelativePath: "333-08.json",
      resumableTotalChunks: 7,
      checksum: "4f36e4cbfc9dfc37559e13bd3a309d55"
    },
    multipleChunksFinalChunk: {
      resumableChunkNumber: 7,
      resumableChunkSize: 1048576,
      resumableCurrentChunkSize: 1048576,
      resumableTotalSize: 7871146,
      resumableType: "application/json",
      resumableIdentifier: "7871146-333-08json",
      resumableFilename: "333-08.json",
      resumableRelativePath: "333-08.json",
      resumableTotalChunks: 7,
      checksum: "4f36e4cbfc9dfc37559e13bd3a309d55"
    },
    singleChunkIdentifierNeedsCleaning: {
      resumableChunkNumber: 1,
      resumableChunkSize: 1048576,
      resumableCurrentChunkSize: 251726,
      resumableTotalSize: 251726,
      resumableType: "application/json",
      resumableIdentifier: "251726&333&08json",
      resumableFilename: "333-08.json",
      resumableRelativePath: "333-08.json",
      resumableTotalChunks: 1,
      checksum: "4f36e4cbfc9dfc37559e13bd3a309d55"
    },
    singleChunkWithFilePart: {
      resumableChunkNumber: 1,
      resumableChunkSize: 1048576,
      resumableCurrentChunkSize: 251726,
      resumableTotalSize: 251726,
      resumableType: "application/json",
      resumableIdentifier: "single-lipsumtxt",
      resumableFilename: "single-lipsum.txt",
      resumableRelativePath: "single-lipsum.txt",
      resumableTotalChunks: 1,
      checksum: "4f36e4cbfc9dfc37559e13bd3a309d55"
    },
    multipleChunksChunkWithAllFileParts: {
      resumableChunkNumber: 1,
      resumableChunkSize: 1048576,
      resumableCurrentChunkSize: 1048576,
      resumableTotalSize: 7871146,
      resumableType: "application/json",
      resumableIdentifier: "multiple-lipsumtxt",
      resumableFilename: "multiple-lipsum.txt",
      resumableRelativePath: "multiple-lipsum.txt",
      resumableTotalChunks: 2,
      checksum: "4f36e4cbfc9dfc37559e13bd3a309d55"
    },
    multipleChunksChunkWithSomeFileParts: {
      resumableChunkNumber: 1,
      resumableChunkSize: 1048576,
      resumableCurrentChunkSize: 1048576,
      resumableTotalSize: 7871146,
      resumableType: "application/json",
      resumableIdentifier: "lipsum-multipletxt",
      resumableFilename: "lipsum-multiple.txt",
      resumableRelativePath: "lipsum-multiple.txt",
      resumableTotalChunks: 3,
      checksum: "4f36e4cbfc9dfc37559e13bd3a309d55"
    }
  },
  invalid: {
    missingChunkNumber: {
      resumableChunkSize: 1048576,
      resumableCurrentChunkSize: 251726,
      resumableTotalSize: 251726,
      resumableType: "application/json",
      resumableIdentifier: "251726-333-08json",
      resumableFilename: "333-08.json",
      resumableRelativePath: "333-08.json",
      resumableTotalChunks: 1,
      checksum: "4f36e4cbfc9dfc37559e13bd3a309d55"
    },
    zeroChunkNumber: {
      resumableChunkNumber: 0,
      resumableChunkSize: 1048576,
      resumableCurrentChunkSize: 251726,
      resumableTotalSize: 251726,
      resumableType: "application/json",
      resumableIdentifier: "251726-333-08json",
      resumableFilename: "333-08.json",
      resumableRelativePath: "333-08.json",
      resumableTotalChunks: 1,
      checksum: "4f36e4cbfc9dfc37559e13bd3a309d55"
    },
    missingChunkSize: {
      resumableChunkNumber: 1,
      resumableCurrentChunkSize: 251726,
      resumableTotalSize: 251726,
      resumableType: "application/json",
      resumableIdentifier: "251726-333-08json",
      resumableFilename: "333-08.json",
      resumableRelativePath: "333-08.json",
      resumableTotalChunks: 1,
      checksum: "4f36e4cbfc9dfc37559e13bd3a309d55"
    },
    zeroChunkSize: {
      resumableChunkNumber: 1,
      resumableChunkSize: 0,
      resumableCurrentChunkSize: 251726,
      resumableTotalSize: 251726,
      resumableType: "application/json",
      resumableIdentifier: "251726-333-08json",
      resumableFilename: "333-08.json",
      resumableRelativePath: "333-08.json",
      resumableTotalChunks: 1,
      checksum: "4f36e4cbfc9dfc37559e13bd3a309d55"
    },
    missingTotalSize: {
      resumableChunkNumber: 1,
      resumableChunkSize: 1048576,
      resumableCurrentChunkSize: 251726,
      resumableType: "application/json",
      resumableIdentifier: "251726-333-08json",
      resumableFilename: "333-08.json",
      resumableRelativePath: "333-08.json",
      resumableTotalChunks: 1,
      checksum: "4f36e4cbfc9dfc37559e13bd3a309d55"
    },
    zeroTotalSize: {
      resumableChunkNumber: 1,
      resumableChunkSize: 1048576,
      resumableCurrentChunkSize: 251726,
      resumableTotalSize: 0,
      resumableType: "application/json",
      resumableIdentifier: "251726-333-08json",
      resumableFilename: "333-08.json",
      resumableRelativePath: "333-08.json",
      resumableTotalChunks: 1,
      checksum: "4f36e4cbfc9dfc37559e13bd3a309d55"
    },
    missingIdentifier: {
      resumableChunkNumber: 1,
      resumableChunkSize: 1048576,
      resumableCurrentChunkSize: 251726,
      resumableTotalSize: 251726,
      resumableType: "application/json",
      resumableFilename: "333-08.json",
      resumableRelativePath: "333-08.json",
      resumableTotalChunks: 1,
      checksum: "4f36e4cbfc9dfc37559e13bd3a309d55"
    },
    emptyIdentifier: {
      resumableChunkNumber: 1,
      resumableChunkSize: 1048576,
      resumableCurrentChunkSize: 251726,
      resumableTotalSize: 251726,
      resumableType: "application/json",
      resumableIdentifier: "",
      resumableFilename: "333-08.json",
      resumableRelativePath: "333-08.json",
      resumableTotalChunks: 1,
      checksum: "4f36e4cbfc9dfc37559e13bd3a309d55"
    },
    missingFilename: {
      resumableChunkNumber: 1,
      resumableChunkSize: 1048576,
      resumableCurrentChunkSize: 251726,
      resumableTotalSize: 251726,
      resumableType: "application/json",
      resumableIdentifier: "251726-333-08json",
      resumableRelativePath: "333-08.json",
      resumableTotalChunks: 1,
      checksum: "4f36e4cbfc9dfc37559e13bd3a309d55"
    },
    emptyFilename: {
      resumableChunkNumber: 1,
      resumableChunkSize: 1048576,
      resumableCurrentChunkSize: 251726,
      resumableTotalSize: 251726,
      resumableType: "application/json",
      resumableIdentifier: "251726-333-08json",
      resumableFilename: "",
      resumableRelativePath: "333-08.json",
      resumableTotalChunks: 1,
      checksum: "4f36e4cbfc9dfc37559e13bd3a309d55"
    },
    chunkNumberTooLarge: {
      resumableChunkNumber: 6,
      resumableChunkSize: 1048576,
      resumableCurrentChunkSize: 251726,
      resumableTotalSize: 251726,
      resumableType: "application/json",
      resumableIdentifier: "251726-333-08json",
      resumableFilename: "333-08.json",
      resumableRelativePath: "333-08.json",
      resumableTotalChunks: 1,
      checksum: "4f36e4cbfc9dfc37559e13bd3a309d55"
    },
    fileSizeTooLarge: {
      resumableChunkNumber: 6,
      resumableChunkSize: 1048576,
      resumableCurrentChunkSize: 251726,
      resumableTotalSize: 42251726,
      resumableType: "application/json",
      resumableIdentifier: "251726-333-08json",
      resumableFilename: "333-08.json",
      resumableRelativePath: "333-08.json",
      resumableTotalChunks: 2,
      checksum: "4f36e4cbfc9dfc37559e13bd3a309d55"
    }
  }
};

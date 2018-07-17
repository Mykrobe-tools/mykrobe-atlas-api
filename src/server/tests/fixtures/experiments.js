import metadata from "./metadata.js";

export default {
  tbUpload: {
    file:
      "/Users/mark/makeandship/mykrobe-atlas-api/src/server/tests/fixtures/files/333-08.fastq.gz"
  },
  tbUploadMetadata: {
    metadata: {
      patient: metadata.uploadedMetadata.patient,
      sample: metadata.uploadedMetadata.sample,
      genotyping: metadata.uploadedMetadata.genotyping,
      phenotyping: metadata.uploadedMetadata.phenotyping
    }
  },
  tbWithPredictorResults: {},
  tbWithTreatment: {},
  tbWithOutcome: {}
};

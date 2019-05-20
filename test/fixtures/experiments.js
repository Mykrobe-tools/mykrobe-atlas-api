import metadata from "./metadata.js";
import results from "./results";

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
  tbUploadMetadataChinese: {
    metadata: {
      patient: metadata.uploadedMetadataChina.patient,
      sample: metadata.uploadedMetadataChina.sample,
      genotyping: metadata.uploadedMetadataChina.genotyping,
      phenotyping: metadata.uploadedMetadataChina.phenotyping
    },
    results: []
  },
  tbWithPredictorResults: {
    metadata: {
      patient: metadata.uploadedMetadataChina.patient,
      sample: metadata.uploadedMetadataChina.sample,
      genotyping: metadata.uploadedMetadataChina.genotyping,
      phenotyping: metadata.uploadedMetadataChina.phenotyping
    },
    results: []
  },
  tbWithTreatment: {
    metadata: {
      patient: metadata.uploadedMetadata.patient,
      sample: metadata.uploadedMetadata.sample,
      genotyping: metadata.uploadedMetadata.genotyping,
      phenotyping: metadata.uploadedMetadata.phenotyping
    },
    results: []
  },
  tbWithOutcome: {
    metadata: {
      patient: metadata.uploadedMetadata.patient,
      sample: metadata.uploadedMetadata.sample,
      genotyping: metadata.uploadedMetadata.genotyping,
      phenotyping: metadata.uploadedMetadata.phenotyping
    },
    results: []
  },
  tbUploadMetadataWithAdditional: {
    metadata: {
      patient: metadata.uploadedMetadata.patient,
      sample: metadata.uploadedMetadata.sample,
      genotyping: metadata.uploadedMetadata.genotyping,
      phenotyping: metadata.uploadedMetadata.phenotyping
    },
    field1: "lorem",
    field2: "ipsum"
  },
  tbUploadMetadataResults: {
    metadata: {
      patient: metadata.uploadedMetadata.patient,
      sample: metadata.uploadedMetadata.sample,
      genotyping: metadata.uploadedMetadata.genotyping,
      phenotyping: metadata.uploadedMetadata.phenotyping
    },
    results: [results.distance.nearestNeighbour, results.distance.treeDistance]
  }
};

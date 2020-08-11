import metadata from "./metadata.js";
import results from "./results";

export default {
  tbUpload: {
    file:
      "/Users/mark/makeandship/mykrobe-atlas-api/src/server/tests/fixtures/files/333-08.fastq.gz"
  },
  tbUploadMetadata: {
    sampleId: "9a981339-d0b4-4dcb-ba0d-efe8ed37b9d6",
    metadata: {
      patient: metadata.uploadedMetadata.patient,
      sample: metadata.uploadedMetadata.sample,
      genotyping: metadata.uploadedMetadata.genotyping,
      phenotyping: metadata.uploadedMetadata.phenotyping
    }
  },
  tbUploadMetadataChinese: {
    sampleId: "44bcd581-cf41-4c81-accd-47f46ce38118",
    metadata: {
      patient: metadata.uploadedMetadataChina.patient,
      sample: metadata.uploadedMetadataChina.sample,
      genotyping: metadata.uploadedMetadataChina.genotyping,
      phenotyping: metadata.uploadedMetadataChina.phenotyping
    },
    results: []
  },
  tbWithPredictorResults: {
    sampleId: "00799852-a529-4196-aa02-d3be912b874a",
    metadata: {
      patient: metadata.uploadedMetadataChina.patient,
      sample: metadata.uploadedMetadataChina.sample,
      genotyping: metadata.uploadedMetadataChina.genotyping,
      phenotyping: metadata.uploadedMetadataChina.phenotyping
    },
    results: []
  },
  tbWithTreatment: {
    sampleId: "b4934c03-551b-4f19-ba33-8eb3789e116e",
    metadata: {
      patient: metadata.uploadedMetadata.patient,
      sample: metadata.uploadedMetadata.sample,
      genotyping: metadata.uploadedMetadata.genotyping,
      phenotyping: metadata.uploadedMetadata.phenotyping
    },
    results: []
  },
  tbWithOutcome: {
    sampleId: "3980fa29-254a-42b0-9fa7-d9942e86edea",
    metadata: {
      patient: metadata.uploadedMetadata.patient,
      sample: metadata.uploadedMetadata.sample,
      genotyping: metadata.uploadedMetadata.genotyping,
      phenotyping: metadata.uploadedMetadata.phenotyping
    },
    results: []
  },
  tbUploadMetadataWithAdditional: {
    sampleId: "d8d61b92-b07e-4099-a70d-bb5bbe3b6930",
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
    sampleId: "49f90e7b-9827-43c1-bfa3-0feac8d02f96",
    metadata: {
      patient: metadata.uploadedMetadata.patient,
      sample: metadata.uploadedMetadata.sample,
      genotyping: metadata.uploadedMetadata.genotyping,
      phenotyping: metadata.uploadedMetadata.phenotyping
    },
    results: [results.distance.nearestNeighbour, results.distance.treeDistance]
  },
  tbUploadMetadataPredictorResults: {
    sampleId: "f194df25-2a8b-4f4d-8594-e013ac58223a",
    metadata: {
      patient: metadata.uploadedMetadata.patient,
      sample: metadata.uploadedMetadata.sample,
      genotyping: metadata.uploadedMetadata.genotyping,
      phenotyping: metadata.uploadedMetadata.phenotyping
    },
    results: [results.predictor]
  }
};

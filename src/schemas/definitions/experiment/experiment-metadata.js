const Metadata = {
  type: "object",
  title: "Metadata",
  properties: {
    patient: {
      $ref: "#/definitions/Patient"
    },
    sample: {
      $ref: "#/definitions/Sample"
    },
    genotyping: {
      $ref: "#/definitions/Genotyping"
    },
    phenotyping: {
      $ref: "#/definitions/Phenotyping"
    },
    treatment: {
      $ref: "#/definitions/Treatment"
    },
    outcome: {
      $ref: "#/definitions/Outcome"
    }
  }
};

export { Metadata };

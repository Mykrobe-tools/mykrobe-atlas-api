const Result = {
  type: "object",
  title: "Result",
  properties: {
    type: {
      title: "Type",
      type: "string"
    },
    analysed: {
      title: "Analysed",
      type: "string"
    },
    susceptitibility: {
      title: "Susceptibility",
      type: "array",
      items: {
        name: {
          title: "Name",
          type: "string"
        },
        prediction: {
          title: "Prediction",
          type: "string",
          enum: ["R", "S"]
        },
        calledBy: {
          title: "Called by",
          type: "object"
        }
      }
    },
    phylogenetics: {
      title: "Phylogenetics",
      type: "array",
      items: {
        type: {
          title: "Name",
          type: "string"
        },
        result: {
          title: "Name",
          type: "string"
        },
        percentCoverage: {
          title: "Percent coverage",
          type: "number"
        },
        medianDepth: {
          title: "Median depth",
          type: "number"
        }
      }
    },
    variantCalls: {
      title: "Variant calls",
      type: "object"
    },
    sequenceCalls: {
      title: "Sequence calls",
      type: "object"
    },
    kmer: {
      title: "KMER",
      type: "number"
    },
    probeSets: {
      title: "Probe sets",
      type: "array",
      items: {
        title: "Probe set",
        type: "string"
      }
    },
    file: {
      title: "Files",
      type: "array",
      items: {
        title: "File",
        type: "string"
      }
    },
    version: {
      title: "Version",
      type: "object"
    },
    genotypeModel: {
      title: "Genotype model",
      type: " string"
    }
  }
};

export { Result };

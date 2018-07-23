const uploadExperimentSchema = {
  $id: "https://api.atlas-dev.makeandship.com/schemas/upload-experiment.json",
  type: "object",
  $schema: "http://json-schema.org/draft-07/schema#",
  properties: {
    name: {
      type: "string"
    },
    path: {
      type: "string"
    },
    accessToken: {
      type: "string"
    },
    provider: {
      type: "string",
      enum: ["dropbox", "box", "googleDrive", "oneDrive"]
    }
  },
  when: [
    {
      case: {
        properties: {
          provider: { enum: ["googleDrive"] }
        }
      },
      deepRequired: ["/accessToken"]
    }
  ]
};

export default uploadExperimentSchema;

import { definitions } from "./definitions/experiment";

const experimentSchema = {
  $id: "https://api.atlas-dev.makeandship.com/schemas/experiment.json",
  type: "object",
  $schema: "http://json-schema.org/draft-07/schema#",
  definitions,
  properties: {
    organisation: { $ref: "#/definitions/Organisation" },
    metadata: { $ref: "#/definitions/Metadata" },
    location: { $ref: "#/definitions/Location" },
    collected: {
      type: "string",
      format: "date-time"
    },
    uploaded: {
      type: "string",
      format: "date-time"
    },
    resistance: { $ref: "#/definitions/Resistance" },
    jaccardIndex: { $ref: "#/definitions/Distance" },
    snpDistance: { $ref: "#/definitions/Distance" },
    geoDistance: { $ref: "#/definitions/Distance" },
    file: {
      type: "string"
    }
  }
};

export default experimentSchema;

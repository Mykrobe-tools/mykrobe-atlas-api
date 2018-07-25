import parser from "json-schema-parser";
import schemaFaker from "./schema-faker";

class Randomizer {
  constructor(options) {
    if (options && options.schema) {
      this.schema = options.schema;
    } else {
      throw Error("Please provide a valid schema");
    }
  }

  generateSample() {
    try {
      const parsableSchema = JSON.parse(JSON.stringify(this.schema));
      const parsedSchema = parser.parse(parsableSchema);
      return schemaFaker.sample(parsedSchema.properties);
    } catch (e) {
      throw e;
    }
  }
}

export default Randomizer;

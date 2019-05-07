import mongoose from "mongoose";
import { coercer, schemaBuilder } from "makeandship-api-common/lib/modules/jsonschema";

class JSONMongooseSchema extends mongoose.Schema {
  constructor(schema, extensions = {}, options = {}) {
    const model = schemaBuilder.generateModel(schema, extensions);
    super(model, options);

    /**
     * coerce data on schema save
     */
    this.pre("save", async function() {
      const payload = this;
      await coercer.coerce(schema, payload);
    });

    /**
     * coerce data on schema update
     */
    this.pre("update", async function() {
      const update = this.getUpdate();
      await coercer.coerce(schema, update);
    });

    /**
     * Support .id as well as ._id
     */
    this.virtual("id").get(function() {
      return this._id.toHexString();
    });
  }
}

export default JSONMongooseSchema;

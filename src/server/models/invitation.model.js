import mongoose from "mongoose";
import schemaValidator from "mongoose-jsonschema-validator";
import { invitation as invitationJsonSchema } from "mykrobe-atlas-jsonschema";
import { APIError } from "makeandship-api-common/lib/modules/error";
import Constants from "../Constants";
import JSONMongooseSchema from "./jsonschema.model";
import InvitationJSONTransformer from "../transformers/InvitationJSONTransformer";

/**
 * InvitationSchema Schema
 */
const InvitationSchema = new JSONMongooseSchema(
  invitationJsonSchema,
  {
    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation"
    }
  },
  {}
);

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 * - plugins
 */

InvitationSchema.plugin(schemaValidator, {
  jsonschema: invitationJsonSchema,
  modelName: "Invitation"
});

/**
 * Methods
 */
InvitationSchema.method({});

/**
 * Statics
 */
InvitationSchema.statics = {
  /**
   * Get invitation by id
   * @param {ObjectId} id - The objectId of invitation.
   * @returns {Promise<invitation, APIError>}
   */
  async get(id) {
    try {
      const invitation = await this.findById(id)
        .populate(["organisation"])
        .exec();
      if (invitation) {
        return invitation;
      }
      throw new APIError(Constants.ERRORS.GET_INVITATION, `Invitation not found with id ${id}`);
    } catch (e) {
      throw new APIError(Constants.ERRORS.GET_INVITATION, e.message);
    }
  },

  /**
   * List a limit of 50 invitations
   * @param {number} skip - Number of invitations to be skipped.
   * @param {number} limit - Limit number of invitations to be returned.
   * @returns {Promise<Organisation[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .populate(["organisation"])
      .skip(skip)
      .limit(limit)
      .exec();
  }
};

/**
 * Json transformation with shared transformer
 */
InvitationSchema.set("toJSON", {
  transform(doc, ret) {
    return new InvitationJSONTransformer().transform(ret);
  }
});

/**
 * @typedef InvitationSchema
 */
export default mongoose.model("Invitation", InvitationSchema);

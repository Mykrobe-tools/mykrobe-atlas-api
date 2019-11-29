import mongoose from "mongoose";
import slugify from "slugify";
import errors from "errors";

import { organisation as organisationJsonSchema } from "mykrobe-atlas-jsonschema";

import JSONMongooseSchema from "./jsonschema.model";

import OrganisationJSONTransformer from "../transformers/OrganisationJSONTransformer";

import AccountsHelper from "../helpers/AccountsHelper";

const keycloak = AccountsHelper.keycloakInstance();

/**
 * Organisation Schema
 */
const OrganisationSchema = new JSONMongooseSchema(
  organisationJsonSchema,
  {
    owners: [
      {
        type: "ObjectId",
        ref: "User"
      }
    ],
    members: [
      {
        type: "ObjectId",
        ref: "User"
      }
    ],
    unapprovedMembers: [
      {
        type: "ObjectId",
        ref: "User"
      }
    ]
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

OrganisationSchema.pre("save", async function() {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true });
    const membersGroup = await keycloak.createGroup(`${this.slug}-members`);
    const ownersGroup = await keycloak.createGroup(`${this.slug}-owners`);
    const role = await keycloak.createRole(this.slug);
    this.membersGroupId = membersGroup.id;
    this.ownersGroupId = ownersGroup.id;
    await keycloak.createGroupRoleMapping(this.membersGroupId, role.roleName);
    await keycloak.createGroupRoleMapping(this.ownersGroupId, role.roleName);
  }
});

/**
 * Methods
 */
OrganisationSchema.method({});

/**
 * Statics
 */
OrganisationSchema.statics = {
  /**
   * Get organisation
   * @param {ObjectId} id - The objectId of experiment.
   * @returns {Promise<Organisation, APIError>}
   */
  async get(id) {
    try {
      const organisation = await this.findById(id)
        .populate(["owners", "members", "unapprovedMembers"])
        .exec();
      if (organisation) {
        return organisation;
      }
      throw new errors.ObjectNotFound(`Organisation not found with id ${id}`);
    } catch (e) {
      throw new errors.ObjectNotFound(e.message);
    }
  },

  /**
   * Finds and updates the organisation
   * @returns {Promise<Organisation, APIError>}
   */
  async findOrganisationAndUpdate(query, newData) {
    const organisation = await this.findOneAndUpdate(query, newData, {
      new: true,
      upsert: true
    }).exec();
    return organisation;
  },

  /**
   * List a limit of 50 organisations
   * @param {number} skip - Number of organisations to be skipped.
   * @param {number} limit - Limit number of organisations to be returned.
   * @returns {Promise<Organisation[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .populate(["owners", "members", "unapprovedMembers"])
      .skip(skip)
      .limit(limit)
      .exec();
  }
};

OrganisationSchema.set("toJSON", {
  transform(doc, ret) {
    return new OrganisationJSONTransformer().transform(ret);
  }
});

/**
 * @typedef Organisation
 */
export default mongoose.model("Organisation", OrganisationSchema);

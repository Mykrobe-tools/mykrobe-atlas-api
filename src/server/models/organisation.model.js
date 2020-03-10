import mongoose from "mongoose";
import slugify from "slugify";
import uniqueValidator from "mongoose-unique-validator";

import { organisation as organisationJsonSchema } from "mykrobe-atlas-jsonschema";

import { APIError } from "makeandship-api-common/lib/modules/error";

import JSONMongooseSchema from "./jsonschema.model";

import OrganisationJSONTransformer from "../transformers/OrganisationJSONTransformer";

import AccountsHelper from "../helpers/AccountsHelper";

import Constants from "../Constants";

/**
 * Organisation Schema
 */
const OrganisationSchema = new JSONMongooseSchema(
  organisationJsonSchema,
  {
    owners: [
      {
        type: "ObjectId",
        ref: "Member"
      }
    ],
    members: [
      {
        type: "ObjectId",
        ref: "Member"
      }
    ],
    unapprovedMembers: [
      {
        type: "ObjectId",
        ref: "Member"
      }
    ],
    rejectedMembers: [
      {
        type: "ObjectId",
        ref: "Member"
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
OrganisationSchema.pre("validate", async function(next) {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true });
  }
});

OrganisationSchema.path("name").validate(
  function(value) {
    return new Promise(resolve => {
      if (this.isNew) {
        const model = this.model(this.constructor.modelName);
        model.count({ name: value }, (err, count) => {
          return resolve(count === 0);
        });
      } else {
        return resolve(true);
      }
    });
  },
  "Organisation already exists with name {VALUE}",
  "unique"
);

OrganisationSchema.path("slug").validate(
  function(value) {
    return new Promise(resolve => {
      if (this.isNew) {
        const model = this.model(this.constructor.modelName);
        model.count({ slug: value }, (err, count) => {
          return resolve(count === 0);
        });
      } else {
        return resolve(true);
      }
    });
  },
  "An organisation with slug {VALUE} has been used in the past and cannot be used again",
  "unique"
);

OrganisationSchema.pre("save", async function(next) {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true });
  }

  await AccountsHelper.setupGroupsAndRoles(this);
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
        .populate(["owners", "members", "unapprovedMembers", "rejectedMembers"])
        .exec();
      if (organisation) {
        return organisation;
      }
      throw new APIError(Constants.ERRORS.GET_ORGANISATION, `Organisation not found with id ${id}`);
    } catch (e) {
      throw new APIError(Constants.ERRORS.GET_ORGANISATION, e.message);
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
      .populate(["owners", "members", "rejectedMembers", "unapprovedMembers"])
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

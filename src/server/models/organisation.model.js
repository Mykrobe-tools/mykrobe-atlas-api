import mongoose from "mongoose";
import slugify from "slugify";
import uniqueValidator from "mongoose-unique-validator";

import { organisation as organisationJsonSchema } from "mykrobe-atlas-jsonschema";

import { APIError } from "makeandship-api-common/lib/modules/error";

import JSONMongooseSchema from "./jsonschema.model";

import OrganisationJSONTransformer from "../transformers/OrganisationJSONTransformer";

import AccountsService from "makeandship-api-common/lib/modules/accounts/AccountsService";
import AccountsSettings from "../modules/accounts/AccountsSettings";
import Logger from "../modules/logging/logger";

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

  await this.maybeCreateOwnerGroup(this.slug);
  await this.maybeCreateMemberGroup(this.slug);
});

/**
 * Methods
 */
OrganisationSchema.method({
  getOwnerGroup: function(slug) {
    return `${slug}-owners`;
  },
  maybeCreateOwnerGroup: function(slug) {
    if (slug) {
      const name = this.getOwnerGroup(slug);
      this.maybeCreateGroup(slug, name);
    }
  },
  getMemberGroup: function(slug) {
    return `${slug}-members`;
  },
  maybeCreateMemberGroup: async function(slug) {
    if (slug) {
      const name = this.getMemberGroup(slug);
      this.maybeCreateGroup(slug, name);
    }
  },
  maybeCreateGroup: async function(slug, name) {
    if (slug && name) {
      const role = slug;

      const service = new AccountsService(AccountsSettings.getSettings());

      const membersExists = await service.groupExists(name);
      const members = membersExists
        ? await service.getGroup(name)
        : await service.createGroup(name);
      await service.addRoleToGroup(role, members);
    }
  }
});

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

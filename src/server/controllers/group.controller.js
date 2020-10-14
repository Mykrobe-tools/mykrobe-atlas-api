import httpStatus from "http-status";
import normalizer from "makeandship-api-common/lib/modules/jsonschema/normalizer";
import { coercer } from "makeandship-api-common/lib/modules/jsonschema";
import Validator from "makeandship-api-common/lib/modules/ajv/Validator";
import { ErrorUtil, APIError } from "makeandship-api-common/lib/modules/error";
import { group as groupSchema } from "mykrobe-atlas-jsonschema";
import ArrayJSONTransformer from "makeandship-api-common/lib/transformers/ArrayJSONTransformer";

import Group from "../models/group.model";
import Search from "../models/search.model";
import GroupJSONTransformer from "../transformers/GroupJSONTransformer";
import Constants from "../Constants";
import GroupHelper from "../helpers/GroupHelper";

/**
 * Load group and append to req.
 */
const load = async (req, res, next, id) => {
  try {
    const group = await Group.get(id);
    req.group = group;
    return next();
  } catch (e) {
    return res.jerror(e);
  }
};

/**
 * Create a new group
 * @param req
 * @param res
 * @returns {*}
 */
const create = async (req, res) => {
  const body = normalizer.normalize(groupSchema, req.body);
  const group = new Group(body);

  try {
    const savedGroup = await group.save();
    return res.jsend(savedGroup);
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.CREATE_GROUP));
  }
};

/**
 * return a list of groups
 * @param req
 * @param res
 * @returns {*}
 */
const list = async (req, res) => {
  const { limit = 50, skip = 0 } = req.query;
  try {
    const groups = await Group.list({ limit, skip });
    const transformer = new ArrayJSONTransformer();
    return res.jsend(
      transformer.transform(groups, {
        transformer: GroupJSONTransformer
      })
    );
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.GET_GROUPS));
  }
};

/**
 * This is a function to update an existing group
 * @param req
 * @param res
 * @returns {*}
 */
const update = async (req, res) => {
  const body = normalizer.normalize(groupSchema, req.body);

  const groupData = Object.assign(req.group.toObject(), body);
  const validationData = Object.assign({}, groupData);
  await coercer.coerce(groupSchema, validationData);

  const validator = new Validator(groupSchema, {});
  const validationErrors = validator.validate(validationData);
  if (validationErrors) {
    const validationError = ErrorUtil.convert(
      { errors: validationErrors },
      Constants.ERRORS.UPDATE_GROUP
    );
    return res.jerror(validationError);
  }

  try {
    const group = Object.assign(req.group, body);
    const savedGroup = await group.save();

    return res.jsend(savedGroup);
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.UPDATE_GROUP));
  }
};

/**
 * Remove a given group
 * @param {*} req
 * @param {*} res
 */
const remove = async (req, res) => {
  const group = req.group;
  try {
    await group.remove();
    return res.jsend("Group was successfully deleted.");
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.DELETE_GROUP));
  }
};

/**
 * Get a group
 * @param {*} req
 * @param {*} res
 */
const get = (req, res) => res.jsend(req.group);

const search = async (req, res) => {
  try {
    if (req.group) {
      // call search for a single group
      await GroupHelper.triggerSearch(req.group);
    } else {
      // call search for all groups
      const groups = await Group.list();
      groups.forEach(async group => await GroupHelper.triggerSearch(group));
    }
    return res.jsend("Search triggered");
  } catch (e) {
    return res.jerror(new APIError(e.message, httpStatus.INTERNAL_SERVER_ERROR));
  }
};

export default { create, list, update, get, remove, search, load };

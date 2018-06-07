import errors from "errors";
import Organisation from "../models/organisation.model";
import OrganisationJSONTransformer from "../transformers/OrganisationJSONTransformer";
import ArrayJSONTransformer from "../transformers/ArrayJSONTransformer";

/**
 * Load organisation and append to req.
 */
async function load(req, res, next, id) {
  try {
    const organisation = await Organisation.get(id);
    req.organisation = organisation;
    return next();
  } catch (e) {
    return res.jerror(e);
  }
}

/**
 * Get organisation
 * @returns {Organisation}
 */
function get(req, res) {
  return res.jsend(req.organisation);
}

/**
 * Create new organisation
 * @returns {Organisation}
 */
async function create(req, res) {
  const organisation = new Organisation(req.body);
  try {
    const savedOrganisation = await organisation.save();
    return res.jsend(savedOrganisation);
  } catch (e) {
    return res.jerror(new errors.CreateOrganisationError(e.message));
  }
}

/**
 * Update existing organisation
 * @returns {Organisation}
 */
async function update(req, res) {
  const organisation = Object.assign(req.organisation, req.body);
  try {
    const savedOrganisation = await organisation.save();
    return res.jsend(savedOrganisation);
  } catch (e) {
    return res.jerror(new errors.UpdateOrganisationError(e.message));
  }
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {Organisation[]}
 */
async function list(req, res) {
  const { limit = 50, skip = 0 } = req.query;
  try {
    const organisations = await Organisation.list({ limit, skip });
    const transformer = new ArrayJSONTransformer(organisations, {
      transformer: OrganisationJSONTransformer
    });
    return res.jsend(transformer.transform());
  } catch (e) {
    return res.jerror(e);
  }
}

/**
 * Delete organisation.
 * @returns {Organisation}
 */
async function remove(req, res) {
  const organisation = req.organisation;
  try {
    await organisation.remove();
    return res.jsend("Organisation was successfully deleted.");
  } catch (e) {
    return res.jerror(e);
  }
}

export default {
  load,
  get,
  create,
  update,
  list,
  remove
};

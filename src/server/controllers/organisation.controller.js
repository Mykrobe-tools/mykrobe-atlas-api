import errors from "errors";
import ArrayJSONTransformer from "makeandship-api-common/lib/transformers/ArrayJSONTransformer";
import Organisation from "../models/organisation.model";
import OrganisationJSONTransformer from "../transformers/OrganisationJSONTransformer";

/**
 * Load organisation and append to req.
 */
const load = async (req, res, next, id) => {
  try {
    const organisation = await Organisation.get(id);
    req.organisation = organisation;
    return next();
  } catch (e) {
    return res.jerror(e);
  }
};

/**
 * Get organisation
 * @returns {Organisation}
 */
const get = (req, res) => res.jsend(req.organisation);

/**
 * Create new organisation
 * @returns {Organisation}
 */
const create = async (req, res) => {
  const organisation = new Organisation(req.body);
  organisation.owners.push(req.dbUser);
  organisation.members.push(req.dbUser);
  try {
    const savedOrganisation = await organisation.save();
    return res.jsend(savedOrganisation);
  } catch (e) {
    return res.jerror(new errors.CreateOrganisationError(e.message));
  }
};

/**
 * Update existing organisation
 * @returns {Organisation}
 */
const update = async (req, res) => {
  const organisation = Object.assign(req.organisation, req.body);
  try {
    const savedOrganisation = await organisation.save();
    return res.jsend(savedOrganisation);
  } catch (e) {
    return res.jerror(new errors.UpdateOrganisationError(e.message));
  }
};

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {Organisation[]}
 */
const list = async (req, res) => {
  const { limit = 50, skip = 0 } = req.query;
  try {
    const organisations = await Organisation.list({ limit, skip });
    const transformer = new ArrayJSONTransformer();
    return res.jsend(
      transformer.transform(organisations, {
        transformer: OrganisationJSONTransformer
      })
    );
  } catch (e) {
    return res.jerror(e);
  }
};

/**
 * Delete organisation.
 * @returns {Organisation}
 */
const remove = async (req, res) => {
  const organisation = req.organisation;
  try {
    await organisation.remove();
    return res.jsend("Organisation was successfully deleted.");
  } catch (e) {
    return res.jerror(e);
  }
};

export default {
  load,
  get,
  create,
  update,
  list,
  remove
};

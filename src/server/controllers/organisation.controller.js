import errors from 'errors';
import Organisation from '../models/organisation.model';
import OrganisationJSONTransformer from '../transformers/OrganisationJSONTransformer';
import ArrayJSONTransformer from '../transformers/ArrayJSONTransformer';

/**
 * Load organisation and append to req.
 */
function load(req, res, next, id) {
  Organisation.get(id)
    .then((organisation) => {
      req.organisation = organisation; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => res.jerror(e));
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
function create(req, res) {
  const organisation = new Organisation(req.body);
  organisation.save()
    .then(savedOrganisation => res.jsend(savedOrganisation))
    .catch(e => res.jerror(new errors.CreateOrganisationError(e.message)));
}

/**
 * Update existing organisation
 * @returns {Organisation}
 */
function update(req, res) {
  const organisation = Object.assign(req.organisation, req.body);
  organisation.save()
    .then(savedOrganisation => res.jsend(savedOrganisation))
    .catch(e => res.jerror(new errors.UpdateOrganisationError(e.message)));
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {Organisation[]}
 */
function list(req, res) {
  const { limit = 50, skip = 0 } = req.query;
  Organisation.list({ limit, skip })
    .then((organisations) => {
      const transformer = new ArrayJSONTransformer(organisations,
        { transformer: OrganisationJSONTransformer });
      res.jsend(transformer.transform());
    })
    .catch(e => res.jerror(e));
}

/**
 * Delete organisation.
 * @returns {Organisation}
 */
function remove(req, res) {
  const organisation = req.organisation;
  organisation.remove()
    .then(() => res.jsend('Organisation was successfully deleted.'))
    .catch(e => res.jerror(e));
}

/**
 * Update metadata template
 * @returns {Organisation}
 */
function updateTemplate(req, res) {
  const organisation = req.organisation;
  organisation.template = req.body.template;
  organisation.save()
    .then(savedOrganisation => res.jsend(savedOrganisation))
    .catch(e => res.jerror(new errors.UpdateOrganisationError(e.message)));
}

export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  updateTemplate
};

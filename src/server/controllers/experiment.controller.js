import errors from 'errors';
import Experiment from '../models/experiment.model';
import ExperimentJSONTransformer from '../transformers/ExperimentJSONTransformer';
import ArrayJSONTransformer from '../transformers/ArrayJSONTransformer';

/**
 * Load user and append to req.
 */
function load(req, res, next, id) {
  Experiment.get(id)
    .then((experiment) => {
      req.experiment = experiment; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => res.jerror(e));
}

/**
 * Get user
 * @returns {User}
 */
function get(req, res) {
  return res.jsend(req.experiment);
}

/**
 * Create new user
 * @property {string} req.body.firstname - The firstname of user.
 * @property {string} req.body.lastname - The lastname of user.
 * @property {string} req.body.profile - The profile of user.
 * @returns {User}
 */
function create(req, res) {
  const experiment = new Experiment(req.body);
  experiment.owner = req.dbUser;
  experiment.save()
    .then(savedExperiment => res.jsend(savedExperiment))
    .catch(e => res.jerror(new errors.CreateExperimentError(e.message)));
}

/**
 * Update existing user
 * @property {string} req.body.firstname - The firstname of user.
 * @property {string} req.body.lastname - The lastname of user.
 * @returns {User}
 */
function update(req, res) {
  res.jsend('update experiment');
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
function list(req, res) {
  const { limit = 50, skip = 0 } = req.query;
  Experiment.list({ limit, skip })
    .then((experiments) => {
      const transformer = new ArrayJSONTransformer(experiments,
        { transformer: ExperimentJSONTransformer });
      res.jsend(transformer.transform());
    })
    .catch(e => res.jerror(e));
}

/**
 * Delete user.
 * @returns {User}
 */
function remove(req, res) {
  const experiment = req.experiment;
  experiment.remove()
    .then(() => res.jsend('Experiment was successfully deleted.'))
    .catch(e => res.jerror(e));
}

export default {
  load,
  get,
  create,
  update,
  list,
  remove
};

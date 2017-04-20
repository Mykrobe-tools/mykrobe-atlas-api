import errors from 'errors';
import Experiment from '../models/experiment.model';
import Metadata from '../models/metadata.model';
import Organisation from '../models/organisation.model';
import ExperimentJSONTransformer from '../transformers/ExperimentJSONTransformer';
import ArrayJSONTransformer from '../transformers/ArrayJSONTransformer';

/**
 * Load experiment and append to req.
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
 * Get experiment
 * @returns {Experiment}
 */
function get(req, res) {
  return res.jsend(req.experiment);
}

/**
 * Create new experiment
 * @returns {Experiment}
 */
function create(req, res) {
  const experiment = new Experiment(req.body);
  experiment.owner = req.dbUser;

  if (req.body.organisation) {
    return Organisation.findOrganisationAndUpdate(req.body.organisation, req.body.organisation)
      .then((organisation) => {
        experiment.organisation = organisation;
        experiment.save()
          .then(savedExperiment => res.jsend(savedExperiment))
          .catch(e => res.jerror(new errors.CreateExperimentError(e.message)));
      })
      .catch(e => res.jerror(new errors.CreateExperimentError(e.message)));
  }

  return experiment.save()
    .then(savedExperiment => res.jsend(savedExperiment))
    .catch(e => res.jerror(new errors.CreateExperimentError(e.message)));
}

/**
 * Update existing experiment
 * @returns {Experiment}
 */
function update(req, res) {
  const experiment = Object.assign(req.experiment, req.body);
  experiment.save()
    .then(savedExperiment => res.jsend(savedExperiment))
    .catch(e => res.jerror(new errors.CreateExperimentError(e.message)));
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

/**
 * Update experiment metadata
 * @returns {Experiment}
 */
function updateMetadata(req, res) {
  const metadata = new Metadata(req.body);
  const experiment = req.experiment;
  experiment.metadata = metadata;
  experiment.save()
    .then(savedExperiment => res.jsend(savedExperiment))
    .catch(e => res.jerror(new errors.CreateExperimentError(e.message)));
}

export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  updateMetadata
};

import User from '../models/user.model';
import Experiment from '../models/experiment.model';
import Organisation from '../models/organisation.model';

beforeAll((done) => {
  User.remove({})
    .then(() => {
      Experiment.remove({})
        .then(() => {
          Organisation.remove({}, done);
        });
    });
});

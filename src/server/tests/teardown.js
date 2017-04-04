import User from '../models/user.model';

beforeAll((done) => {
  User.remove({})
    .then(() => done());
});

import faker from "faker";
import _ from "lodash";
import User from "../models/user.model";
import Organisation from "../models/organisation.model";
import Experiment from "../models/experiment.model";

/**
 * Clears the data in the db
 * @param req
 * @param res
 * @returns {*}
 */
const clean = async (req, res) => {
  await User.remove({});
  await Experiment.remove({});
  await Organisation.remove({});
  return res.jsend("data cleared successfully");
};

/**
 * Creates the data in the db
 * @param req
 * @param res
 * @returns {*}
 */
const create = async (req, res) => {
  const total = req.body.total || 50;
  const promises = [];
  for (let index = 0; index < total; index += 1) {
    promises.push(saveExperiment());
  }
  const results = await Promise.all(promises);
  return res.jsend(results);
};

const saveExperiment = async () => {
  const savedOrganisation = await saveOrganisation();
  const savedOwner = await saveOwner();
  const experiment = new Experiment({
    organisation: savedOrganisation,
    owner: savedOwner,
    location: {
      name: faker.address.city(),
      lat: faker.address.latitude(),
      lng: faker.address.longitude()
    },
    collected: faker.date.past(),
    uploaded: faker.date.past(),
    resistance: {},
    jaccardIndex: {
      analysed: faker.date.past(),
      engine: faker.lorem.word(),
      version: faker.fake("v{{random.number}}")
    },
    snpDistance: {
      analysed: faker.date.past(),
      engine: faker.lorem.word(),
      version: faker.fake("v{{random.number}}")
    },
    geoDistance: {
      analysed: faker.date.past(),
      engine: faker.lorem.word(),
      version: faker.fake("v{{random.number}}")
    },
    file: faker.system.fileName()
  });
  return experiment.save();
};

const saveOrganisation = () => {
  const organisation = new Organisation({
    name: faker.company.companyName()
  });
  return organisation.save();
};

const saveOwner = () => {
  const owner = new User({
    firstname: faker.name.firstName(),
    lastname: faker.name.lastName(),
    phone: faker.phone.phoneNumber(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    valid: true
  });
  return owner.save();
};

const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min)) + min;

export default { clean, create };

import faker from "faker";
import _ from "lodash";
import User from "../models/user.model";
import Organisation from "../models/organisation.model";
import Experiment from "../models/experiment.model";
import { experiment as experimentSchema } from "mykrobe-atlas-jsonschema";
import { user as userSchema } from "mykrobe-atlas-jsonschema";
import Randomizer from "../modules/Randomizer";

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
  try {
    const results = await Promise.all(promises);
    return res.jsend(results);
  } catch (e) {
    res.jerror(e);
  }
};

const saveExperiment = async () => {
  const experimentRandomizer = new Randomizer({ schema: experimentSchema });
  const userRandomizer = new Randomizer({ schema: userSchema });
  const experimentData = experimentRandomizer.generateSample();
  const ownerData = userRandomizer.generateSample();
  const owner = await new User(ownerData).save();
  experimentData.owner = owner;
  const experiment = new Experiment(experimentData);
  return experiment.save();
};

const saveExperiment2 = async () => {
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

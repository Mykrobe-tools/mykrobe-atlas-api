import User from "../models/user.model";
import Experiment from "../models/experiment.model";
import * as schemas from "mykrobe-atlas-jsonschema";
import Randomizer from "makeandship-api-common/lib/modules/schema-faker/Randomizer";

/**
 * Clears the data in the db
 * @param req
 * @param res
 * @returns {*}
 */
const clean = async (req, res) => {
  await User.remove({});
  await Experiment.remove({});
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
  const savedOwner = await saveOwner();
  const experimentRandomizer = new Randomizer(schemas.experiment, {});
  const experimentData = experimentRandomizer.sample();
  experimentData.owner = savedOwner;
  return new Experiment(experimentData).save();
};

const saveOwner = () => {
  const userRandomizer = new Randomizer(schemas.user, {});
  const ownerData = userRandomizer.sample();
  return new User(ownerData).save();
};

export default { clean, create };

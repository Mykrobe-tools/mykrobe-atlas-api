import fs from "fs";
import _ from "lodash";
import * as schemas from "mykrobe-atlas-jsonschema";
import Randomizer from "makeandship-api-common/lib/modules/schema-faker/Randomizer";
import { getRandomPercentage } from "makeandship-api-common/lib/modules/schema-faker/utils";
import User from "../models/user.model";
import Experiment from "../models/experiment.model";
import phylogenetics from "../../config/faker/phylogenetics-choices";

// randomizers
const userRandomizer = new Randomizer(schemas.user, {});
const experimentRandomizer = new Randomizer(schemas.experiment, {
  overrides: {
    results: {
      phylogenetics: {
        medianDepth: function(schema, property, data, value) {
          return _.sample([-1, 0, 40, 100, 116, 117, 122]);
        },
        percentCoverage: function(schema, property, data, value) {
          return getRandomPercentage();
        },
        type: function(schema, property, data, value) {
          return _.sample(Object.keys(phylogenetics));
        },
        result: function(schema, property, data, value) {
          const path = property.split(".");
          const type = data.results[path[1]].phylogenetics[path[3]].type;
          const possibleResults = Object.keys(phylogenetics[type]);
          return _.sample(possibleResults);
        }
      }
    }
  }
});

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
  const owners = await createOwners(5);
  const promises = [];
  for (let index = 0; index < total; index += 1) {
    promises.push(saveExperiment(_.sample(owners)));
  }
  try {
    const results = await Promise.all(promises);
    return res.jsend(results);
  } catch (e) {
    res.jerror(e);
  }
};

const saveExperiment = async owner => {
  const experimentData = experimentRandomizer.sample();
  experimentData.owner = owner;
  return new Experiment(experimentData).save();
};

const saveOwner = () => {
  const ownerData = userRandomizer.sample();
  return new User(ownerData).save();
};

const createOwners = count => {
  const promises = [];
  for (let index = 0; index < count; index += 1) {
    promises.push(saveOwner());
  }
  return Promise.all(promises);
};

const generatePhylogenetics = (
  schema,
  property,
  data,
  choices = phylogenetics,
  phylogeneticsArray = []
) => {
  if (choices && Object.keys(choices)) {
    Object.keys(choices).forEach(type => {
      const possibleResults = Object.keys(choices[type]);
      const result = _.sample(possibleResults);
      phylogeneticsArray.push({
        type,
        result,
        percentCoverage: getRandomPercentage(),
        medianDepth: _.sample([-1, 0, 40, 100, 116, 117, 122])
      });
      generatePhylogenetics(schema, property, data, choices[type][result], phylogeneticsArray);
    });
  }
  return phylogeneticsArray;
};

export default { clean, create };

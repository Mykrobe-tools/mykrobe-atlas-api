import { argv } from "yargs";
import fs from "fs";
import axios from "axios";
import logger from "../server/modules/logging/logger";

const { basePath, username, password, folder } = argv;
let token, mapping;

// main function
async function main() {
  try {
    await init();
    await load();
  } catch (error) {
    logger.error(error);
  }
}

// save the token and mapping
async function init() {
  try {
    token = await getToken();
    mapping = await getMapping();
  } catch (error) {
    logger.error(error);
  }
}

// load the json files
async function load() {
  logger.info(`Loading from: ${folder}`);

  if (!fs.existsSync(folder)) {
    throw new Error(`Cannot find ${folder} directory`);
  }

  const files = fs.readdirSync(folder);
  for (let file of files) {
    if (file.includes(".json")) {
      await process(`${folder}/${file}`);
    }
  }
}

// post the results to the api
async function process(file) {
  const rawdata = fs.readFileSync(file);
  const experimentId = getExperimentId(rawdata);
  if (experimentId) {
    const result = transform(rawdata);
    logger.info(`processing experiment id: ${experimentId}`);
    //post results
    await axios.post(`${basePath}/experiments/${experimentId}/results`, result);
  }
}

// transform the result to a format accepted by the api
function transform(rawData) {
  const data = JSON.parse(rawData);
  return {
    type: "predictor",
    result: data
  };
}

// get the experimentId from the mapping
function getExperimentId(rawData) {
  const data = JSON.parse(rawData);
  const isolateId = Object.keys(data)[0];
  return mapping[isolateId];
}

// get the user token
async function getToken() {
  logger.info(`getting the token for : ${username}`);
  // post results
  const response = await axios.post(`${basePath}/auth/login`, { username, password });
  return response.data.data.access_token;
}

// get the mapping isolateId -> experimentId
async function getMapping() {
  logger.info("getting the mapping");
  const auth = `Bearer ${token}`;
  // post results
  const response = await axios.get(`${basePath}/experiments/mappings`, {
    headers: { Authorization: auth }
  });
  return response.data.data;
}

main();

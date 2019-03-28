import axios from "axios";
import config from "../../../config/env";

/**
 * Call the tree endpoint
 * @param {Object} query
 */
const callTreeApi = async () => {
  try {
    const response = await axios.get(`${config.services.analysisApiUrl}/tree/latest`);
    return response.data && response.data.result;
  } catch (e) {
    throw e;
  }
};

const tree = Object.freeze({
  callTreeApi
});

export default tree;

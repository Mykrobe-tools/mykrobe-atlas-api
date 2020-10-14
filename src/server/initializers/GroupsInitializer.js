import fs from "fs";
import Group from "../models/group.model";
import config from "../../config/env";
import logger from "../modules/logger";

/**
 * A cache initializer create groups
 */
class GroupsInitializer {
  async initialize() {
    try {
      const rawdata = fs.readFileSync(config.express.groupsLocation);
      const groups = JSON.parse(rawdata);
      await Group.clear();
      groups.forEach(async group => await new Group(group).save());
      logger.info(`GroupsInitializer: ${groups.length} created.`);
    } catch (e) {
      logger.error(`Error in GroupsInitializer: ${e.message}`);
    }
  }
}

export default GroupsInitializer;

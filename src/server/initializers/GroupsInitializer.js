import fs from "fs";
import Group from "../models/group.model";
import { parseQuery } from "../modules/search";
import GroupHelper from "../helpers/GroupHelper";

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
      for (let raw of groups) {
        const group = await new Group(raw);
        const { bigsi } = parseQuery({ q: raw.searchQuery });
        if (bigsi) {
          const { type, query } = bigsi;
          group.search = await GroupHelper.getOrCreateSearch({ type, bigsi: { query } });
        }
        await group.save();
      }
      logger.info(`GroupsInitializer: ${groups.length} created.`);
    } catch (e) {
      logger.error(`Error in GroupsInitializer: ${e.message}`);
    }
  }
}

export default GroupsInitializer;

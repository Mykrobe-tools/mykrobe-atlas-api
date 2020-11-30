import fs from "fs";
import Group from "../models/group.model";
import { parseQuery } from "../modules/search";
import GroupHelper from "../helpers/GroupHelper";

import config from "../../config/env";
import logger from "../modules/logging/logger";

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
        const searches = [];
        if (Array.isArray(raw.searchQuery)) {
          for (const query of raw.searchQuery) {
            const searchQuery = await this.handleSearchQuery(query);
            if (searchQuery) {
              searches.push(searchQuery);
            }
          }
        } else {
          const searchQuery = await this.handleSearchQuery(raw.searchQuery);
          if (searchQuery) {
            searches.push(searchQuery);
          }
        }
        group.searches = searches;
        await group.save();
      }
      logger.info(`GroupsInitializer: ${groups.length} created.`);
    } catch (e) {
      logger.error(`Error in GroupsInitializer: ${e.message}`);
    }
  }

  async handleSearchQuery(searchQuery) {
    const { bigsi } = parseQuery({ q: searchQuery });
    if (bigsi) {
      const { type, query } = bigsi;
      const search = await GroupHelper.getOrCreateSearch({ type, bigsi: { query } });
      return search;
    }

    return null;
  }
}

export default GroupsInitializer;

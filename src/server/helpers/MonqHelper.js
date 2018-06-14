import monq from "monq";

class MonqHelper {
  static getClient(config) {
    if (config && config.db && config.db.uri) {
      const dbUri = config.db.uri;
      return monq(dbUri);
    }

    return null;
  }
}

export default MonqHelper;

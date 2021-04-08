const NodeEnvironment = require("jest-environment-node");
const path = require("path");
const fs = require("fs");

//const setup = require("./JestSetup");

const globalConfigPath = path.join(__dirname, "globalConfig.json");

class MongoEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    const globalConfig = JSON.parse(fs.readFileSync(globalConfigPath, "utf-8"));

    this.global.__MONGO_URI__ = globalConfig.mongoUri;
    this.global.__MONGO_DB_NAME__ = globalConfig.mongoDBName;
    this.global.__CONFIG__ = globalConfig.config;

    console.log(`Global: ${JSON.stringify(globalConfig, null, 2)}`);

    await super.setup();
  }

  async teardown() {
    console.log(`MongoEnvironment teardown: enter`);
    await super.teardown();
    console.log(`MongoEnvironment teardown: exit`);
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = MongoEnvironment;

const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

// ensure environment variables are available
require("dotenv").config();

module.exports = async () => {
  const { MongoMemoryServer } = require("mongodb-memory-server");
  const globalConfigPath = path.join(__dirname, "globalConfig.json");

  const mongoServerConfig = {
    autoStart: false,
    instance: {
      dbName: "mykrobe-test"
    },
    binary: {
      version: "3.6.1",
      ssl: true
    }
  };
  if (process.env.MONGOMS_ARCH) {
    mongoServerConfig.binary.arch = process.env.MONGOMS_ARCH;
  }
  if (
    process.env.MONGOMS_DEBUG &&
    (process.env.MONGOMS_DEBUG === 1 || process.env.MONGOMS_DEBUG === "1")
  ) {
    mongoServerConfig.debug = true;
  }
  const mongod = new MongoMemoryServer(mongoServerConfig);

  if (!mongod.isRunning) {
    await mongod.start();
  }

  const sharedConfig = {
    mongoDBName: mongoServerConfig.instance.dbName,
    mongoUri: await mongod.getUri()
  };

  // Set reference to mongod in order to close the server during teardown.
  global.__MONGOD__ = mongod;

  // Express setup
  const opts = { useNewUrlParser: true, useUnifiedTopology: true };
  await mongoose.connect(sharedConfig.mongoUri, opts, err => {
    if (err) console.error(err);
  });

  // Write global config to disk because all tests run in different contexts.
  fs.writeFileSync(globalConfigPath, JSON.stringify(sharedConfig));
};

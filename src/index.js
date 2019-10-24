import {} from "dotenv/config";
import mongoose from "mongoose";
import util from "util";
import config from "./config/env";
import createApp from "./server/app";
import errors from "./config/errors-definition";

require("./express-jsend");
const app = createApp();
const debug = require("debug")("atlas:index");

// make bluebird default Promise
Promise = require("bluebird"); // eslint-disable-line no-global-assign

// plugin bluebird promise in mongoose
mongoose.Promise = Promise;

// connect to mongo db
mongoose.connect(config.db.uri, {});
mongoose.connection.on("error", () => {
  throw new Error(`unable to connect to database: ${config.db.uri}`);
});

// print mongoose logs in dev env
if (config.db.MONGOOSE_DEBUG) {
  mongoose.set("debug", (collectionName, method, query, doc) => {
    debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });
}

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  // listen on port config.port
  app.listen(config.express.port, () => {
    debug(`server started on port ${config.express.port} (${config.env})`);
  });
}

// enable reverse proxy support
app.enable("trust proxy");
// enable strong etag
app.set("etag", "strong");

errors.create();

export default app;

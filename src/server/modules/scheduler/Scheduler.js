import Agenda from "agenda";

import AnalysisServiceBinding from "./AnalysisServiceBinding";
import logger from "../logging/logger";
import config from "../../../config/env";

class Scheduler {
  // this should be private - no syntax in ES6 at present
  constructor() {
    logger.debug(`Scheduler#constructor: enter`);
    this.ready = false;
    this.initialized = false;
    logger.debug(`Scheduler#constructor: exit`);
  }

  static async getInstance() {
    logger.debug(`Scheduler#getInstance: enter`);
    if (!this.instance) {
      this.instance = new Scheduler();
      await this.instance.initialize();
    }

    // exists but not initialized
    if (!this.initialized) {
      await this.instance.initialize();
    }

    logger.debug(`Scheduler#getInstance: exit`);
    return this.instance;
  }

  schedule(when, job, params = {}) {
    if (when && job) {
      logger.debug(`Scheduling job '${job}' at '${when}'`);
      this.agenda.schedule(when, job, params);
    } else {
      logger.debug(`Unable to schedule job.  When or job not found`);
    }
  }

  async initializeAgenda() {
    const that = this;

    that.agenda = new Agenda({ db: { address: config.db.uri } });
    that.binding = new AnalysisServiceBinding(that);

    return new Promise((resolve, reject) => {
      // define services
      that.agenda.define("call analysis api", async job => {
        await that.binding.predictor(job);
      });
      that.agenda.define("call distance api", async job => {
        await that.binding.distance(job);
      });
      that.agenda.define("call search api", async job => {
        await that.binding.search(job);
      });
      that.agenda.define("call cluster api", async job => {
        await that.binding.cluster(job);
      });

      // initialise services when ready
      that.agenda.on("ready", async () => {
        that.ready = true;
        logger.debug("Agenda is ready ...");

        await that.agenda.start();

        that.initialized = true;
        logger.debug("Agenda has initialized ...");

        resolve();
      });

      // close for any errors
      this.agenda.on("error", e => {
        that.agenda.stop();

        that.ready = false;
        that.initialized = false;

        reject(e);
      });
    });
  }

  async initialize() {
    if (!this.initialized) {
      // initialize agenda instance
      await this.initializeAgenda();
    }
  }
}

export default Scheduler;

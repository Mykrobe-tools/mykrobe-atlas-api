import app from "express";
import {
  ExpressInitializer,
  JsendInitializer
} from "makeandship-api-common/lib/modules/express/initializers";
import logger from "./winston";

const initalizer = new ExpressInitializer();

logger.log("info", "ExpressInitializer#initialize: Start initialization");
initalizer.add(new JsendInitializer());
initalizer.initialize(app);
logger.log("info", "ExpressInitializer#initialize: Initialization ended");

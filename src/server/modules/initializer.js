import app from "express";
import {
  ExpressInitializer,
  JsendInitializer
} from "makeandship-api-common/lib/modules/express/initializers";
import logger from "./winston";

const initalizer = new ExpressInitializer();

logger.debug("ExpressInitializer#initialize: Start initialization");
initalizer.add(new JsendInitializer());
initalizer.initialize(app);
logger.debug("ExpressInitializer#initialize: Initialization ended");

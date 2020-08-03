import Agenda from "agenda";
import logger from "./logger";
import AgendaHelper from "../helpers/AgendaHelper";
import config from "../../config/env";

// agenda config
const agendaInstance = new Agenda({ db: { address: config.db.uri } });
logger.debug(`agendaInstance: ${agendaInstance}`);

agendaInstance.define("call analysis api", AgendaHelper.callAnalysisApi.bind(agendaInstance));

agendaInstance.define("call distance api", AgendaHelper.callDistanceApi.bind(agendaInstance));

agendaInstance.define("call search api", AgendaHelper.callSearchApi.bind(agendaInstance));

agendaInstance.define("refresh isolateId", AgendaHelper.refreshIsolateId.bind(agendaInstance));

agendaInstance.on("ready", async () => {
  logger.debug("Agenda is ready ...");
  await agendaInstance.start();
  await agendaInstance.every("0 0 * * *", "refresh isolateId");
});

agendaInstance.on("error", () => {
  agendaInstance.stop();
});

const schedule = (when, job, params) => {
  logger.debug(`#schedule`);
  logger.debug(`#schedule: agendaInstance: ${agendaInstance}`);
  agendaInstance.schedule(when, job, params);
};

export { schedule };

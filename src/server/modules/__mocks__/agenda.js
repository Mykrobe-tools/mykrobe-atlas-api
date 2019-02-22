import Agenda from "agenda";
import winston from "winston";
import AgendaHelper from "../../helpers/AgendaHelper";
import config from "../../../config/env";

const getInstance = dbUri => new Agenda({ db: { address: dbUri } });

const schedule = (when, job, params) => {
  const agendaInstance = getInstance(config.db.uri);

  agendaInstance.define("call analysis api", AgendaHelper.callAnalysisApi.bind(agendaInstance));

  agendaInstance.define("call distance api", AgendaHelper.callDistanceApi.bind(agendaInstance));

  agendaInstance.define("refresh isolateId", AgendaHelper.refreshIsolateId.bind(agendaInstance));

  agendaInstance.on("ready", async () => {
    winston.info("agenda is ready and started.");
    await agendaInstance.start();
    await agendaInstance.every("0 0 * * *", "refresh isolateId");
    agendaInstance.schedule(when, job, params);
  });

  agendaInstance.on("error", () => {
    agendaInstance.stop();
  });
};

const agenda = Object.freeze({
  schedule
});

export default agenda;

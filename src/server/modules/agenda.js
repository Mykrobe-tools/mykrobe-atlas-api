import Agenda from "agenda";
import winston from "winston";
import axios from "axios";
import Audit from "../models/audit.model";
import AgendaHelper from "../helpers/AgendaHelper";
import config from "../../config/env";

// agenda config
const agendaInstance = new Agenda({ db: { address: config.db.uri } });

agendaInstance.define("call analysis api", AgendaHelper.callAnalysisApi.bind(agendaInstance));

agendaInstance.define("call distance api", AgendaHelper.callDistanceApi.bind(agendaInstance));

agendaInstance.define("call search api", AgendaHelper.callSearchApi.bind(agendaInstance));

agendaInstance.define("refresh isolateId", AgendaHelper.refreshIsolateId.bind(agendaInstance));

agendaInstance.on("ready", async () => {
  winston.info("agenda is ready and started.");
  await agendaInstance.start();
  await agendaInstance.every("0 0 * * *", "refresh isolateId");
});

agendaInstance.on("error", () => {
  agendaInstance.stop();
});

const schedule = (when, job, params) => agendaInstance.schedule(when, job, params);

const agenda = Object.freeze({
  schedule
});

export default agenda;

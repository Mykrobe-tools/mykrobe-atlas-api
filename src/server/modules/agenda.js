import Agenda from "agenda";
import winston from "winston";
import axios from "axios";
import Audit from "../models/audit.model";
import AgendaHelper from "../helpers/AgendaHelper";
import config from "../../config/env";

// agenda config
const agendaInstance = new Agenda({ db: { address: config.db.uri } });

agendaInstance.define(
  "call analysis api",
  AgendaHelper.callAnalysisApi.bind(agendaInstance)
);

agendaInstance.define(
  "call distance api",
  AgendaHelper.callDistanceApi.bind(agendaInstance)
);

agendaInstance.define(
  "call search api",
  AgendaHelper.callSearchApi.bind(agendaInstance)
);

agendaInstance.on("ready", () => {
  winston.info("agenda is ready and started.");
  agendaInstance.start();
});

agendaInstance.on("error", () => {
  agendaInstance.stop();
});

const schedule = (when, job, params) =>
  agendaInstance.schedule(when, job, params);

const agenda = Object.freeze({
  schedule
});

export default agenda;

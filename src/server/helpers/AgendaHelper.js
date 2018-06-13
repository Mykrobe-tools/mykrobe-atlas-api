import Agenda from "agenda";

class AgendaHelper {
  static getInstance(config) {
    if (config && config.db && config.db.agenda) {
      return config.db.agenda;
    }

    if (config && config.db && config.db.uri) {
      return new Agenda({ db: { address: config.db.uri } });
    }

    return null;
  }
}

export default AgendaHelper;

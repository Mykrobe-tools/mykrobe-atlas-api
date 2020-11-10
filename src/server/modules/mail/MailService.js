import config from "../../../config/env";

class MailService {
  constructor() {}

  async send(params = {}) {
    throw new Error("The send method must be implemented");
  }
}

export default MailService;

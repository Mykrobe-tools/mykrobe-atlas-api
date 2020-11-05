import MailService from "./MailService";
import config from "../../../config/env";

class MandrillService extends MailService {
  constructor() {
    super();
  }

  async send(params = {}) {
    // need to be called at runtime to mock it if necessary
    const mandrill = require("mandrill-api/mandrill");

    const { templateName, email, content } = params;

    const { mandrill: mandrillConfig } = config.mail.providers;
    const { mail: mailConfig } = config;

    const client = new mandrill.Mandrill(mandrillConfig.apiKey);

    const message = {
      subject: content.subject,
      from_email: mailConfig.from,
      from_name: mailConfig.fromName,
      to: [{ email }],
      global_merge_vars: this.arrayFromObject(content)
    };

    const template = {
      template_name: templateName,
      template_content: [],
      message: message,
      async: false
    };

    return new Promise((resolve, reject) => {
      client.messages.sendTemplate(
        template,
        result => {
          resolve(result);
        },
        e => {
          console.error(e);
          reject(e);
        }
      );
    });
  }

  arrayFromObject(content) {
    const val = [];
    for (const key in content) {
      val.push({ name: key, content: content[key] });
    }
    return val;
  }
}

export default MandrillService;

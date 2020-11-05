import config from "../../../config/env";

class MandrillService {
  static async sendTemplate(templateName, email, content = {}) {
    // need to be called at runtime to mock it if necessary
    const mandrill = require("mandrill-api/mandrill");

    const { mandrill: mandrillConfig } = config.services;
    const client = new mandrill.Mandrill(mandrillConfig.apiKey);

    const message = {
      subject: content.subject,
      from_email: mandrillConfig.from,
      from_name: mandrillConfig.fromName,
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

  static arrayFromObject(content) {
    const val = [];
    for (const key in content) {
      val.push({ name: key, content: content[key] });
    }
    return val;
  }
}

export default MandrillService;

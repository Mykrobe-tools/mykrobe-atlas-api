import MandrillService from "./MandrillService";

/**
 * A factory class class to create the mail service
 */
class MailProviderFactory {
  static create(provider) {
    switch (provider) {
      case "Mandrill":
        return new MandrillService();

      default:
        return null;
    }

    return null;
  }
}

export default MailProviderFactory;

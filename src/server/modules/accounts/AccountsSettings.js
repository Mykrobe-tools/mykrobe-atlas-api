import config from "../../../config/env";

class AccountsSettings {
  getSettings() {
    return config.accounts.keycloak;
  }
}

export default new AccountsSettings();

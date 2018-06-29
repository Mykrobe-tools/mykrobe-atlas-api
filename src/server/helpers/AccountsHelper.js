import errors from "errors";
import { Keycloak } from "makeandship-api-common/lib/modules/accounts";
import config from "../../config/env";
import User from "../models/user.model";
import UserJSONTransformer from "../transformers/UserJSONTransformer";
import APIError from "../helpers/APIError";

class AccountsHelper {
  static usePassword(config) {
    return config.communications.username === "email";
  }

  static keycloakInstance() {
    return new Keycloak({
      keycloakConfig: config.accounts.keycloak,
      errors,
      userModel: User,
      userTransformer: UserJSONTransformer,
      apiError: APIError
    });
  }
}

export default AccountsHelper;

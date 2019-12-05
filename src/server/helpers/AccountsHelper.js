import errors from "errors";
import httpStatus from "http-status";
import { Keycloak } from "makeandship-api-common/lib/modules/accounts";
import { AuthError } from "makeandship-api-common/lib/modules/error";
import config from "../../config/env";
import User from "../models/user.model";
import UserJSONTransformer from "../transformers/UserJSONTransformer";
import Constants from "../Constants";

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
      apiError: new AuthError(
        Constants.ERRORS.INVALID_CREDENTIALS,
        null,
        null,
        httpStatus.UNAUTHORIZED
      )
    });
  }

  static async setupGroupsAndRoles(organisation) {
    const keycloak = this.keycloakInstance();
    const membersGroup = await keycloak.createGroupIfMissing(`${organisation.slug}-members`);
    const ownersGroup = await keycloak.createGroupIfMissing(`${organisation.slug}-owners`);
    const roleName = await keycloak.createRoleIfMissing(organisation.slug);
    organisation.membersGroupId = membersGroup.id;
    organisation.ownersGroupId = ownersGroup.id;
    await keycloak.createGroupRoleMapping(organisation.membersGroupId, roleName);
    await keycloak.createGroupRoleMapping(organisation.ownersGroupId, roleName);
  }
}

export default AccountsHelper;

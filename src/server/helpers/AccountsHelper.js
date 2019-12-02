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

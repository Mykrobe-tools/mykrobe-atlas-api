import httpStatus from "http-status";
import { Keycloak } from "makeandship-api-common/lib/modules/accounts";
import AccountsService from "makeandship-api-common/lib/modules/accounts/AccountsService";
import { AuthError } from "makeandship-api-common/lib/modules/error";

import config from "../../config/env";

import logger from "../modules/logging/logger";

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

  static getMembersGroup(slug) {
    return `${slug}-members`;
  }

  static getOwnersGroup(slug) {
    return `${slug}-owners`;
  }

  static async setupGroupsAndRoles(organisation) {
    logger.debug("AccountsHelper#setupGroupsAndRoles: enter");
    if (organisation) {
      const service = new AccountsService(AccountsHelper.getAccountSettings());

      const slug = organisation.slug;
      if (slug) {
        const role = slug;

        const membersName = this.getMembersGroup(slug);
        const ownersName = this.getOwnersGroup(slug);

        const membersExists = await service.groupExists(membersName);
        const members = membersExists
          ? await service.getGroup(membersName)
          : await service.createGroup(membersName);
        const membersId = members.id;
        await service.addRoleToGroup(role, members);

        const ownersExists = await service.groupExists(ownersName);
        const owners = membersExists
          ? await service.getGroup(ownersName)
          : await service.createGroup(ownersName);
        const ownerId = owners.id;
        await service.addRoleToGroup(role, owners);

        // const keycloak = this.keycloakInstance();
        // const membersGroup = await keycloak.createGroupIfMissing(`${organisation.slug}-members`);
        // const ownersGroup = await keycloak.createGroupIfMissing(`${organisation.slug}-owners`);
        // const roleName = await keycloak.createRoleIfMissing(organisation.slug);
        // organisation.membersGroupId = membersGroup.id;
        // organisation.ownersGroupId = ownersGroup.id;
        // await keycloak.createGroupRoleMapping(organisation.membersGroupId, roleName);
        // await keycloak.createGroupRoleMapping(organisation.ownersGroupId, roleName);
      }
    }
    logger.debug("AccountsHelper#setupGroupsAndRoles: exit");
  }

  static getAccountSettings() {
    return config.accounts.keycloak;
  }
}

export default AccountsHelper;

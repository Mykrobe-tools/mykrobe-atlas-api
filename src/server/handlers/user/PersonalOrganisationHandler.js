import UserHandler from "./UserHandler";

import Organisation from "../../models/organisation.model";

import OrganisationHelper from "../../helpers/OrganisationHelper";
import AccountsHelper from "../../helpers/AccountsHelper";

/**
 * A user personal organisation handler
 */
class PersonalOrganisationHandler extends UserHandler {
  canHandle(user) {
    return user && !user.organisation;
  }

  async handle(user) {
    const keycloak = AccountsHelper.keycloakInstance();
    const organisation = new Organisation({ name: `${user.firstname} ${user.lastname}` });
    const member = await OrganisationHelper.createMember(user);
    organisation.owners.push(member);

    try {
      const savedOrganisation = await organisation.save();
      user.organisation = savedOrganisation;
      await keycloak.addToGroup(savedOrganisation.ownersGroupId, user.keycloakId);
      await user.save();
    } catch (e) {
      return;
    }
  }
}

export default PersonalOrganisationHandler;

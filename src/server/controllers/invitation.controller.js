import { APIError } from "makeandship-api-common/lib/modules/error";

import AccountsHelper from "../helpers/AccountsHelper";
import OrganisationHelper from "../helpers/OrganisationHelper";
import Constants from "../Constants";

const keycloak = AccountsHelper.keycloakInstance();

/**
 * Load invitation and append to req.
 */
const load = async (req, res, next) => {
  const { invitations } = req.dbUser;
  const invitation = invitations.find(
    item => item.id === req.params.id && item.status === Constants.INVITATION_STATUS.PENDING
  );
  if (invitation) {
    req.invitation = invitation;
    return next();
  }

  return res.jerror(
    new APIError(Constants.ERRORS.GET_INVITATION, "No pending invitation with the provided id")
  );
};

/**
 * Accept invitation
 * @returns {Invitation}
 */
const accept = async (req, res) => {
  const user = req.dbUser;
  const member = await OrganisationHelper.getOrCreateMember(user);
  const invitation = req.invitation;
  const { organisation } = invitation;
  organisation.members.push(member);
  invitation.status = Constants.INVITATION_STATUS.ACCEPTED;

  await organisation.save();
  const savedInvitation = await invitation.save();
  await keycloak.addToGroup(organisation.membersGroupId, user.keycloakId);

  const currentUserOrganisation = user.organisation;
  const hasNoMembers = await OrganisationHelper.hasNoMembers(currentUserOrganisation);
  if (hasNoMembers) {
    await OrganisationHelper.migrateSamples(currentUserOrganisation, organisation);

    user.organisation = null;
    await user.save();
    await currentUserOrganisation.remove();
  }

  return res.jsend(savedInvitation);
};

/**
 * Reject invitation
 * @returns {Invitation}
 */
const reject = async (req, res) => {
  const invitation = req.invitation;
  invitation.status = Constants.INVITATION_STATUS.DECLINED;
  const savedInvitation = await invitation.save();
  return res.jsend(savedInvitation);
};

export default {
  load,
  accept,
  reject
};

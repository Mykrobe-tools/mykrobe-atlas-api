import errors from "errors";
import ArrayJSONTransformer from "makeandship-api-common/lib/transformers/ArrayJSONTransformer";

import Organisation from "../models/organisation.model";
import User from "../models/user.model";
import Member from "../models/member.model";

import OrganisationJSONTransformer from "../transformers/OrganisationJSONTransformer";
import UserJSONTransformer from "../transformers/UserJSONTransformer";
import OrganisationHelper from "../helpers/OrganisationHelper";
import AccountsHelper from "../helpers/AccountsHelper";

const keycloak = AccountsHelper.keycloakInstance();

/**
 * Load organisation and append to req.
 */
const load = async (req, res, next, id) => {
  try {
    const organisation = await Organisation.get(id);
    req.organisation = organisation;
    return next();
  } catch (e) {
    return res.jerror(e);
  }
};

/**
 * Get organisation
 * @returns {Organisation}
 */
const get = (req, res) => res.jsend(req.organisation);

/**
 * Create new organisation
 * @returns {Organisation}
 */
const create = async (req, res) => {
  const organisation = new Organisation(req.body);
  const member = await OrganisationHelper.createMember(req.dbUser);
  organisation.owners.push(member);
  try {
    const savedOrganisation = await organisation.save();
    await keycloak.addToGroup(savedOrganisation.ownersGroupId, req.dbUser.keycloakId);
    return res.jsend(savedOrganisation);
  } catch (e) {
    return res.jerror(new errors.CreateOrganisationError(e.message));
  }
};

/**
 * Update existing organisation
 * @returns {Organisation}
 */
const update = async (req, res) => {
  const organisation = Object.assign(req.organisation, req.body);
  try {
    const savedOrganisation = await organisation.save();
    return res.jsend(savedOrganisation);
  } catch (e) {
    return res.jerror(new errors.UpdateOrganisationError(e.message));
  }
};

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {Organisation[]}
 */
const list = async (req, res) => {
  const { limit = 50, skip = 0 } = req.query;
  try {
    const organisations = await Organisation.list({ limit, skip });
    const transformer = new ArrayJSONTransformer();
    return res.jsend(
      transformer.transform(organisations, {
        transformer: OrganisationJSONTransformer
      })
    );
  } catch (e) {
    return res.jerror(e);
  }
};

/**
 * Delete organisation.
 * @returns {Organisation}
 */
const remove = async (req, res) => {
  const organisation = req.organisation;
  try {
    await organisation.remove();
    return res.jsend("Organisation was successfully deleted.");
  } catch (e) {
    return res.jerror(e);
  }
};

/**
 * Join organisation.
 * @returns {Organisation}
 */
const join = async (req, res) => {
  const organisation = req.organisation;
  try {
    const member = await OrganisationHelper.createMember(req.dbUser);
    organisation.unapprovedMembers.push(member);
    await organisation.save();
    return res.jsend("Request sent, waiting for approval.");
  } catch (e) {
    return res.jerror(e);
  }
};

/**
 * Approve a request.
 * @returns {Organisation}
 */
const approve = async (req, res) => {
  const organisation = req.organisation;
  try {
    const userJson = {
      userId: req.dbUser.id,
      ...req.dbUser.toJSON()
    };
    delete userJson.id;
    const member = await Member.get(req.params.memberId);
    member.set("actionedBy", userJson);
    member.set("actionedAt", new Date());
    member.set("action", "approve");
    const savedMember = await member.save();
    organisation.members.push(savedMember);
    await organisation.save();
    const memberUser = await User.get(savedMember.userId);
    await keycloak.addToGroup(organisation.membersGroupId, memberUser.keycloakId);
    return res.jsend("Request approved.");
  } catch (e) {
    return res.jerror(e);
  }
};

/**
 * Reject a request.
 * @returns {Organisation}
 */
const reject = async (req, res) => {
  const organisation = req.organisation;
  try {
    const userJson = {
      userId: req.dbUser.id,
      ...req.dbUser.toJSON()
    };
    delete userJson.id;
    const member = await Member.get(req.params.memberId);
    member.set("actionedBy", userJson);
    member.set("actionedAt", new Date());
    member.set("action", "reject");
    const savedMember = await member.save();
    organisation.rejectedMembers.push(savedMember);
    await organisation.save();
    return res.jsend("Request rejected.");
  } catch (e) {
    return res.jerror(e);
  }
};

/**
 * Remove a member.
 * @returns {Organisation}
 */
const removeMember = async (req, res) => {
  const organisation = req.organisation;
  try {
    const member = await Member.get(req.params.memberId);
    const memberUser = await User.get(member.userId);
    await keycloak.deleteFromGroup(organisation.membersGroupId, memberUser.keycloakId);
    await organisation.save();
    return res.jsend("Member removed successfully.");
  } catch (e) {
    return res.jerror(e);
  }
};

/**
 * Promote a member.
 * @returns {Organisation}
 */
const promote = async (req, res) => {
  const organisation = req.organisation;
  try {
    const userJson = {
      userId: req.dbUser.id,
      ...req.dbUser.toJSON()
    };
    delete userJson.id;
    const member = await Member.get(req.params.memberId);
    member.set("actionedBy", userJson);
    member.set("actionedAt", new Date());
    member.set("action", "promote");
    const savedMember = await member.save();
    organisation.owners.push(savedMember);
    await organisation.save();
    const memberUser = await User.get(savedMember.userId);
    await keycloak.addToGroup(organisation.ownersGroupId, memberUser.keycloakId);
    await keycloak.deleteFromGroup(organisation.membersGroupId, memberUser.keycloakId);
    return res.jsend("Member promoted.");
  } catch (e) {
    return res.jerror(e);
  }
};

/**
 * Demote an owner.
 * @returns {Organisation}
 */
const demote = async (req, res) => {
  const organisation = req.organisation;
  try {
    const userJson = {
      userId: req.dbUser.id,
      ...req.dbUser.toJSON()
    };
    delete userJson.id;
    const member = await Member.get(req.params.memberId);
    member.set("actionedBy", userJson);
    member.set("actionedAt", new Date());
    member.set("action", "demote");
    const savedMember = await member.save();
    organisation.members.push(savedMember);
    await organisation.save();
    const memberUser = await User.get(savedMember.userId);
    await keycloak.addToGroup(organisation.membersGroupId, memberUser.keycloakId);
    await keycloak.deleteFromGroup(organisation.ownersGroupId, memberUser.keycloakId);
    return res.jsend("Owner demoted.");
  } catch (e) {
    return res.jerror(e);
  }
};

export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  join,
  approve,
  reject,
  removeMember,
  promote,
  demote
};

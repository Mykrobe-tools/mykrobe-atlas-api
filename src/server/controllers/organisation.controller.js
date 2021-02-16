import normalizer from "makeandship-api-common/lib/modules/jsonschema/normalizer";
import { coercer } from "makeandship-api-common/lib/modules/jsonschema";
import ArrayJSONTransformer from "makeandship-api-common/lib/transformers/ArrayJSONTransformer";
import { ValidationError, ErrorUtil, APIError } from "makeandship-api-common/lib/modules/error";
import Validator from "makeandship-api-common/lib/modules/ajv/Validator";

import { organisation as organisationSchema } from "mykrobe-atlas-jsonschema";

import Organisation from "../models/organisation.model";
import User from "../models/user.model";
import Member from "../models/member.model";

import OrganisationJSONTransformer from "../transformers/OrganisationJSONTransformer";
import UserJSONTransformer from "../transformers/UserJSONTransformer";
import OrganisationHelper from "../helpers/OrganisationHelper";
import AccountsHelper from "../helpers/AccountsHelper";

import Constants from "../Constants";

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
  const body = normalizer.normalize(organisationSchema, req.body);
  const organisation = new Organisation(body);

  const member = await OrganisationHelper.getOrCreateMember(req.dbUser);
  organisation.owners.push(member);

  try {
    const savedOrganisation = await organisation.save();
    await keycloak.addToGroup(savedOrganisation.ownersGroupId, req.dbUser.keycloakId);
    return res.jsend(savedOrganisation);
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.CREATE_ORGANISATION));
  }
};

/**
 * Update existing organisation
 * @returns {Organisation}
 */
const update = async (req, res) => {
  const body = normalizer.normalize(organisationSchema, req.body);

  const organisationData = Object.assign(req.organisation.toObject(), body);
  const validationData = Object.assign({}, organisationData);
  await coercer.coerce(organisationSchema, validationData);

  const validator = new Validator(organisationSchema, {});
  const validationErrors = validator.validate(validationData);
  if (validationErrors) {
    const validationError = ErrorUtil.convert(
      { errors: validationErrors },
      Constants.ERRORS.UPDATE_ORGANISATION
    );
    return res.jerror(validationError);
  }

  try {
    const organisation = Object.assign(req.organisation, body);
    const savedOrganisation = await organisation.save();

    return res.jsend(savedOrganisation);
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.UPDATE_ORGANISATION));
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
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.GET_ORGANISATIONS));
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
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.DELETE_ORGANISATION));
  }
};

/**
 * Join organisation.
 * @returns {Organisation}
 */
const join = async (req, res) => {
  const organisation = req.organisation;
  try {
    const member = await OrganisationHelper.getOrCreateMember(req.dbUser);
    organisation.unapprovedMembers.push(member);
    const savedOrganisation = await organisation.save();
    return res.jsend(savedOrganisation);
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.JOIN_ORGANISATION));
  }
};

/**
 * Approve a request.
 * @returns {Organisation}
 */
const approve = async (req, res) => {
  const user = req.dbUser;
  const organisation = req.organisation;
  try {
    const userJson = {
      userId: user.id,
      ...user.toJSON()
    };
    delete userJson.id;
    const member = await Member.get(req.params.memberId);
    member.set("actionedBy", userJson);
    member.set("actionedAt", new Date());
    member.set("action", "approve");
    const savedMember = await member.save();
    organisation.members.push(savedMember);
    const savedOrganisation = await organisation.save();
    const memberUser = await User.get(savedMember.userId);
    await keycloak.addToGroup(organisation.membersGroupId, memberUser.keycloakId);

    const currentUserOrganisation = user.organisation;
    const hasNoMembers = await OrganisationHelper.hasNoMembers(currentUserOrganisation);
    if (hasNoMembers) {
      await OrganisationHelper.migrateSamples(currentUserOrganisation, organisation);

      user.organisation = null;
      await user.save();
      await currentUserOrganisation.remove();
    }

    await OrganisationHelper.sendJoinRequestApprovedNotification(memberUser.email, organisation);

    return res.jsend(savedOrganisation);
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.APPROVE_MEMBER));
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
    const savedOrganisation = await organisation.save();
    return res.jsend(savedOrganisation);
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.REJECT_MEMBER));
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
    const savedOrganisation = await organisation.save();
    return res.jsend(savedOrganisation);
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.REMOVE_MEMBER));
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
    const savedOrganisation = await organisation.save();
    const memberUser = await User.get(savedMember.userId);
    await keycloak.addToGroup(organisation.ownersGroupId, memberUser.keycloakId);
    await keycloak.deleteFromGroup(organisation.membersGroupId, memberUser.keycloakId);
    return res.jsend(savedOrganisation);
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.PROMOTE_MEMBER));
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
    const savedOrganisation = await organisation.save();
    const memberUser = await User.get(savedMember.userId);
    await keycloak.addToGroup(organisation.membersGroupId, memberUser.keycloakId);
    await keycloak.deleteFromGroup(organisation.ownersGroupId, memberUser.keycloakId);
    return res.jsend(savedOrganisation);
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.DEMOTE_MEMBER));
  }
};

/**
 * Invite a member.
 * @returns {*}
 */
const invite = async (req, res) => {
  const organisation = req.organisation;
  const { email } = req.body;
  try {
    const user = await User.findUsersInvitations(email);
    if (user) {
      const existingInvitation = user.invitations.find(
        item => item.organisation.id === organisation.id
      );
      if (existingInvitation) {
        return res.jsend(`This email has already been invited to ${organisation.name}`);
      }
      await OrganisationHelper.createInvitation(organisation, user);
      await OrganisationHelper.sendInvitation(organisation, user.email);
      return res.jsend(`Invitation link sent to ${email}`);
    }
    await OrganisationHelper.sendRegistration(organisation, email);
    return res.jsend(`Registration link sent to ${email}`);
  } catch (e) {
    return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.INVITE_MEMBER));
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
  demote,
  invite
};

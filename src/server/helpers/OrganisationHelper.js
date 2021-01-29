import { APIError } from "makeandship-api-common/lib/modules/error";

import Member from "../models/member.model";
import Experiment from "../models/experiment.model";

import Invitation from "../models/invitation.model";
import MailProviderFactory from "../modules/mail/MailProviderFactory";
import config from "../../config/env";

class OrganisationHelper {
  /**
   * Express middleware to check the current user is in one of the passed lists
   * If the user is in the lists return an error
   * Otherwise move to the next
   * @param {Array} lists
   */
  static checkInLists(code, lists = []) {
    return async (req, res, next) => {
      let currentUserId;
      const organisation = req.organisation;
      if (req.params.memberId) {
        const member = await Member.get(req.params.memberId);
        if (!member) {
          return res.jerror(new APIError(code, `Member not found with id ${req.params.memberId}`));
        }
        currentUserId = member.userId;
      }
      if (!currentUserId) {
        currentUserId = req.dbUser.id;
      }
      for (let list of lists) {
        const foundMember = organisation[list].find(member => member.userId === currentUserId);
        if (foundMember) {
          return res.jerror(new APIError(code, `You are already in the ${list} list`));
        }
      }
      return next();
    };
  }

  /**
   * Express middlware to check if the current user is the owner of the current organisation
   * If the user is the owner go to the next
   * Otherwise throw an error
   */
  static isOwner(code) {
    return async (req, res, next) => {
      const organisation = req.organisation;
      const currentUser = req.dbUser;
      const foundUser = organisation.owners.find(owner => owner.userId === currentUser.id);
      if (!foundUser) {
        return res.jerror(new APIError(code, "You are not an owner of this organisation"));
      }
      return next();
    };
  }

  /**
   * Check the current user is not in any of the lists provided
   * If the user is found in one of the lists delete it and pass to the next step
   * Otherwise throw an error
   * @param {Array} lists
   */
  static checkNotInLists(code, lists = []) {
    return async (req, res, next) => {
      const organisation = req.organisation;
      const memberId = req.params.memberId;
      for (let list of lists) {
        const foundMember = organisation[list].find(member => member.id === memberId);
        if (foundMember) {
          const index = organisation[list].indexOf(foundMember);
          organisation[list].splice(index, 1);
          return next();
        }
      }
      return res.jerror(
        new APIError(code, "The provided member is not eligible for this operation")
      );
    };
  }

  /**
   * An express middleware to check the list is not empty
   * If the list is empty throw an error
   * Otherwise go to the next step
   * @param {Array} lists
   */
  static checkEmptyList(code, list) {
    return async (req, res, next) => {
      const organisation = req.organisation;
      if (organisation[list].length === 0) {
        return res.jerror(new APIError(code, `The ${list} list cannot be empty`));
      }
      return next();
    };
  }

  /**
   * Creates a member from a user
   * @param {User} user
   */
  static async getOrCreateMember(user) {
    const userId = user.id;
    const foundMember = await Member.findByUserId(userId);

    if (foundMember) {
      return foundMember;
    }

    const userJson = {
      userId: user.id,
      ...user.toJSON()
    };
    delete userJson.id;
    const member = new Member(userJson);
    return await member.save();
  }

  /**
   * Create a new invitation
   * @param {*} organisation
   * @param {*} user
   */
  static async createInvitation(organisation, user) {
    const invitation = new Invitation({ status: "Pending", organisation });
    const savedInvitation = await invitation.save();
    user.invitations.push(savedInvitation);
    await user.save();
  }

  /**
   * Send invitation
   * @param {*} organisation
   * @param {*} user
   */
  static async sendInvitation(organisation, email) {
    const mailProvider = MailProviderFactory.create(config.mail.provider);

    const { mail: mailConfig } = config;

    const {
      invitationTemplate: templateName,
      inviteLink: link,
      invitationSubject: subject
    } = mailConfig;

    const params = {
      templateName,
      email,
      content: {
        INVITE_LINK: link,
        subject
      }
    };

    await mailProvider.send(params);
  }

  /**
   * Send registration
   * @param {*} organisation
   * @param {*} user
   */
  static async sendRegistration(organisation, email) {
    const mailProvider = MailProviderFactory.create(config.mail.provider);

    const { mail: mailConfig } = config;

    const {
      registrationTemplate: templateName,
      registerLink: link,
      registrationSubject: subject
    } = mailConfig;

    const params = {
      templateName,
      email,
      content: {
        INVITE_LINK: link,
        subject
      }
    };

    await mailProvider.send(params);
  }

  /**
   * Check if an organisation has no members
   * @param {*} organisation
   */
  static async hasNoMembers(organisation) {
    if (!organisation) {
      return false;
    }

    return organisation.members && organisation.members.length === 0;
  }

  /**
   * Migrate samples from oldOrg to newOrg
   * @param {*} oldOrg
   * @param {*} newOrg
   */
  static async migrateSamples(oldOrg, newOrg) {
    const experiments = await Experiment.findByOrganisation(oldOrg);
    for (const experiment of experiments) {
      experiment.organisation = newOrg;
      await experiment.save();
    }
  }
}

export default OrganisationHelper;

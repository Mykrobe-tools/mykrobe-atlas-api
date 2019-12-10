import Member from "../models/member.model";

class OrganisationHelper {
  /**
   * Express middleware to check the current user is in one of the passed lists
   * If the user is in the lists return an error
   * Otherwise move to the next
   * @param {Array} lists
   */
  static checkInLists(lists = []) {
    return async (req, res, next) => {
      let currentUserId;
      const organisation = req.organisation;
      if (req.params.memberId) {
        const member = await Member.get(req.params.memberId);
        if (!member) {
          return res.jerror(`Member not found with id ${req.params.memberId}`);
        }
        currentUserId = member.userId;
      }
      if (!currentUserId) {
        currentUserId = req.dbUser.id;
      }
      for (let list of lists) {
        const foundMember = organisation[list].find(member => member.userId === currentUserId);
        if (foundMember) {
          return res.jerror(`You are already in the ${list} list`);
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
  static isOwner() {
    return async (req, res, next) => {
      const organisation = req.organisation;
      const currentUser = req.dbUser;
      const foundUser = organisation.owners.find(owner => owner.userId === currentUser.id);
      if (!foundUser) {
        return res.jerror("You are not an owner of this organisation");
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
  static checkNotInLists(lists = []) {
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
      return res.jerror("The provided member is not eligible for this operation");
    };
  }

  /**
   * An express middleware to check the list is not empty
   * If the list is empty throw an error
   * Otherwise go to the next step
   * @param {Array} lists
   */
  static checkEmptyList(list) {
    return async (req, res, next) => {
      const organisation = req.organisation;
      if (organisation[list].length === 0) {
        return res.jerror(`The ${list} list cannot be empty`);
      }
      return next();
    };
  }

  /**
   * Creates a member from a user
   * @param {User} user
   */
  static async createMember(user) {
    const userJson = {
      userId: user.id,
      ...user.toJSON()
    };
    delete userJson.id;
    const member = new Member(userJson);
    return await member.save();
  }
}

export default OrganisationHelper;

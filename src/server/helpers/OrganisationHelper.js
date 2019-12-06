import Member from "../models/member.model";

class OrganisationHelper {
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

  static isOwner() {
    return async (req, res, next) => {
      const organisation = req.organisation;
      const currentUser = req.dbUser;
      const foundUser = organisation.owners.find(user => user.id === currentUser.id);
      if (!foundUser) {
        return res.jerror("You are not an owner of this organisation");
      }
      return next();
    };
  }

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
      return res.jerror("No pending join request found for this user");
    };
  }

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

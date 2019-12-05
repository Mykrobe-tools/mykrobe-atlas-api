class OrganisationHelper {
  static checkInLists(lists = []) {
    return async (req, res, next) => {
      const organisation = req.organisation;
      const currentUser = req.dbUser;
      for (let list of lists) {
        const foundUser = organisation[list].find(user => user.id === currentUser.id);
        if (foundUser) {
          return res.jerror(`You are already in the ${list} list`);
        }
      }
      next();
    };
  }
}

export default OrganisationHelper;

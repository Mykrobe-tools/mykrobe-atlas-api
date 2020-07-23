import httpStatus from "http-status";

import { APIError } from "makeandship-api-common/lib/modules/error";

import Constants from "../Constants";

const ownerOnly = (req, res, next) => {
  const loggedInUserId = req.dbUser && req.dbUser.id;
  const experimentOwnerId = req.experiment && req.experiment.owner && req.experiment.owner.id;
  if (loggedInUserId && experimentOwnerId && loggedInUserId === experimentOwnerId) {
    return next();
  }
  return res.jerror(
    new APIError(
      Constants.ERRORS.NOT_ALLOWED,
      "Only the owner can edit this experiment",
      null,
      httpStatus.UNAUTHORIZED
    )
  );
};

const security = Object.freeze({
  ownerOnly
});

export default security;

import httpStatus from "http-status";
import APIError from "../helpers/APIError";

const ownerOnly = (req, res, next) => {
  const loggedInUserId = req.dbUser && req.dbUser.id;
  const experimentOwnerId =
    req.experiment && req.experiment.owner && req.experiment.owner.id;
  if (
    loggedInUserId &&
    experimentOwnerId &&
    loggedInUserId === experimentOwnerId
  ) {
    return next();
  }
  return res.jerror(
    new APIError(
      "Only the owner can edit this experiment",
      httpStatus.UNAUTHORIZED
    )
  );
};

const security = Object.freeze({
  ownerOnly
});

export default security;

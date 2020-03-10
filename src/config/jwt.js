import User from "../server/models/user.model";

import { ErrorUtil, APIError } from "makeandship-api-common/lib/modules/error";

import Constants from "../server/Constants";

function checkPermission(role) {
  return async (req, res, next) => {
    try {
      const user = await User.get(req.user.id);
      if (user.role === role) {
        next();
      } else {
        return res.jerror(
          new APIError(
            Constants.ERRORS.NOT_ALLOWED,
            `You are not allowed to perform that operation`
          )
        );
      }
    } catch (e) {
      return res.jerror(ErrorUtil.convert(e, Constants.ERRORS.NOT_ALLOWED));
    }
  };
}

export default { checkPermission };

import errors from "errors";
import User from "../server/models/user.model";

function checkPermission(role) {
  return async (req, res, next) => {
    try {
      const user = await User.get(req.user.id);
      if (user.role === role) {
        next();
      } else {
        return res.jerror(new errors.NotAllowed());
      }
    } catch (e) {
      return res.jerror(new errors.NotAllowed(e.message));
    }
  };
}

export default { checkPermission };

import errors from "errors";
import User from "../server/models/user.model";

function checkPermission(role) {
  return (req, res, next) => {
    User.get(req.user.id)
      .then(user => {
        if (user.role === role) {
          next();
        } else {
          res.jerror(new errors.NotAllowed());
        }
      })
      .catch(e => res.jerror(new errors.NotAllowed(e.message)));
  };
}

export default { checkPermission };

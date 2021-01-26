import User from "../models/user.model";

const handlersMiddleware = (userHandlers, otherHandlers) => {
  return async (req, res, next) => {
    if (req.user && req.user.id) {
      const user = await User.get(req.user.id);
      for (const userHandler of userHandlers) {
        const canHandle = userHandler.canHandle(user);
        if (canHandle) {
          await userHandler.handle(user);
        }
      }
    }

    if (otherHandlers && otherHandlers.length > 0) {
      for (const otherHandler of otherHandlers) {
        const canHandle = otherHandler.canHandle(req);
        if (canHandle) {
          await otherHandler.handle(req);
        }
      }
    }

    next();
  };
};

const middlewares = Object.freeze({
  handlersMiddleware
});

export default middlewares;

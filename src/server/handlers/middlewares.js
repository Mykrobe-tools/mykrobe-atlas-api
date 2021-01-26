import User from "../models/user.model";

const handlersMiddleware = handlers => {
  return async (req, res, next) => {
    const user = await User.get(req.user.id);
    for (const handler of handlers) {
      const canHandle = handler.canHandle(user);
      if (canHandle) {
        await handler.handle(user);
      }
    }
    next();
  };
};

const middlewares = Object.freeze({
  handlersMiddleware
});

export default middlewares;

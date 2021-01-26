/**
 * A user handler
 */
class UserHandler {
  canHandle(user) {
    return true;
  }

  async handle(user) {
    return null;
  }
}

export default UserHandler;

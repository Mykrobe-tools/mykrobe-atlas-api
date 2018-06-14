class AccountsHelper {
  static usePassword(config) {
    return config.communications.username === "email";
  }
}

export default AccountsHelper;

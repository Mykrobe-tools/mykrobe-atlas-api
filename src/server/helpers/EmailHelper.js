import validator from "email-validator";

class EmailHelper {
  static isValid(email) {
    return validator.validate(email);
  }
}

export default EmailHelper;

import ModelJSONTransformer from "./ModelJSONTransformer";
import BlacklistTransformer from "./BlacklistTransformer";
import OrganisationJSONTransformer from "./OrganisationJSONTransformer";

const BLACKLIST = [
  "__v",
  "password",
  "verificationToken",
  "resetPasswordToken",
  "valid"
];

/**
 * A class to transform json responses
 * @property response : the response Object from mongoose
 */
class UserJSONTransformer extends ModelJSONTransformer {
  /**
   * The transformation engine
   */
  transform() {
    let res = super.transform();
    res = new BlacklistTransformer(res, { blacklist: BLACKLIST }).transform();
    if (res.organisation) {
      res.organisation = new OrganisationJSONTransformer(
        res.organisation
      ).transform();
    }
    return res;
  }
}

export default UserJSONTransformer;

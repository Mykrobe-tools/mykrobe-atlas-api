import ModelJSONTransformer from "makeandship-api-common/lib/transformers/ModelJSONTransformer";
import BlacklistTransformer from "makeandship-api-common/lib/transformers/BlacklistJSONTransformer";
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
  transform(o) {
    let res = super.transform(o, {});
    res = new BlacklistTransformer().transform(res, { blacklist: BLACKLIST });
    if (res.organisation) {
      res.organisation = new OrganisationJSONTransformer().transform(
        res.organisation
      );
    }
    return res;
  }
}

export default UserJSONTransformer;

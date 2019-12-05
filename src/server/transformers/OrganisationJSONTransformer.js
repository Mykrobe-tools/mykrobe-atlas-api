import ModelJSONTransformer from "makeandship-api-common/lib/transformers/ModelJSONTransformer";
import BlacklistTransformer from "makeandship-api-common/lib/transformers/BlacklistJSONTransformer";

import UserJSONTransformer from "./UserJSONTransformer";

const BLACKLIST = ["__v"];

/**
 * A class to transform json responses
 * @property response : the response Object from mongoose
 */
class OrganisationJSONTransformer extends ModelJSONTransformer {
  /**
   * The transformation engine
   */
  transform(o, options = {}) {
    let res = super.transform(o, options);
    res = new BlacklistTransformer().transform(res, { blacklist: BLACKLIST });

    if (res.owners) {
      res.owners = res.owners.map(owner => new UserJSONTransformer().transform(owner, options));
    }

    if (res.members) {
      res.members = res.members.map(member => new UserJSONTransformer().transform(member, options));
    }

    if (res.awaitingApproval) {
      res.awaitingApproval = res.awaitingApproval.map(awaitingMember =>
        new UserJSONTransformer().transform(awaitingMember, options)
      );
    }

    if (res.rejectedMembers) {
      res.rejectedMembers = res.rejectedMembers.map(rejectedMember =>
        new UserJSONTransformer().transform(rejectedMember, options)
      );
    }

    return res;
  }
}

export default OrganisationJSONTransformer;

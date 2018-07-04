import AggregationsESTransformer from "./AggregationsESTransformer";
import BucketsESTransformer from "./BucketsESTransformer";
import RangesESTransformer from "./RangesESTransformer";
import BlacklistTransformer from "../BlacklistTransformer";

const BLACKLIST = ["doc_count_error_upper_bound", "sum_other_doc_count"];

/**
 * A class to transform es responses
 * @property response : the response Object from es
 */
class ChoicesESTransformer extends AggregationsESTransformer {
  /**
   * The transformation engine
   */
  transform() {
    const o = {};
    const res = super.transform();
    Object.keys(res).forEach(key => {
      if (res[key]) {
        const choice = new BlacklistTransformer(res[key], {
          blacklist: BLACKLIST
        }).transform();
        o[key] = new BucketsESTransformer(choice.buckets, {}).transform();
        if (key.startsWith("max_") || key.startsWith("min_")) {
          new RangesESTransformer(choice, { o, key }).transform();
        }
      }
    });
    return o;
  }
}

export default ChoicesESTransformer;

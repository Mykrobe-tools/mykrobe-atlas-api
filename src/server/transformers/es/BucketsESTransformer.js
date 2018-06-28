import ESTransformer from "./ESTransformer";

/**
 * A class to transform es responses
 * @property response : the response Object from es
 */
class BucketsESTransformer extends ESTransformer {
  transform() {
    const res = super.transform();
    if (Array.isArray(res)) {
      res.forEach(bucket => {
        bucket.count = bucket.doc_count;
        delete bucket.doc_count;
      });
    }
    return res;
  }
}

export default BucketsESTransformer;

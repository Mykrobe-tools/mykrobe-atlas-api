import JSONTransformer from './JSONTransformer';
import IdTransformer from './IdTransformer';

/**
 * A class to transform json responses
 * @property response : the response Object from mongoose
 */
class ModelJSONTransformer extends JSONTransformer {
  transform() {
    let res = super.transform();
    res = new IdTransformer(res).transform();
    return res;
  }
}

export default ModelJSONTransformer;

import JSONTransformer from './JSONTransformer';
/**
 * A class to transform an array of json responses
 * @property response : the response Object from mongoose
 */
class ArrayJSONTransformer extends JSONTransformer {
  constructor(o, options) {
    super(o, options);

    if (options && options.transformer) {
      this.transformer = options.transformer;
    }
  }

  /**
   * Transform an array of results using options.transformer
   * @param {Array} results
   * @return {Array} transformed results
   */
  transform() {
    const options = this.options;

    const Transformer = this.transformer;
    const arr = this.o.map((result) => {
      let transformed = result;

      // if mongoose class - take the Object
      if (typeof (transformed.toObject) === 'function') {
        transformed = transformed.toObject();
      }

      if (Transformer) {
        transformed = new Transformer(transformed, options).transform();
      }

      return transformed;
    });
    return arr;
  }
}

export default ArrayJSONTransformer;

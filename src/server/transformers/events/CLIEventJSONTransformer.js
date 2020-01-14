/**
 * A class to transform async CLI payloads
 */
class CLIEventJSONTransformer {
  /**
   * Transform the object
   * @param {object} o the object to transform
   * @param {object} options to control the transformation
   *
   * @return {object} the transformed object
   */
  transform(o, options) {
    const res = {};

    if (o.taskId) {
      res.taskId = o.taskId;
    }

    if (o.type) {
      res.type = o.type;
    }

    return res;
  }
}

export default CLIEventJSONTransformer;

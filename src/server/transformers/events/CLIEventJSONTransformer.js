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
    const res = { id: options.id, type: options.type };

    if (o.taskId) {
      res.taskId = o.taskId;
    }

    return res;
  }
}

export default CLIEventJSONTransformer;

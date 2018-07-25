class ExperimentsHelper {
  /**
   * Return an array of allowed filters.  Null allows all
   * e.g. metadata.genotyping.wgsPlatform
   *
   * @return {array} allowed filters
   */
  static getFiltersWhitelist() {
    // allow everything
    return null;
  }
}

export default ExperimentsHelper;

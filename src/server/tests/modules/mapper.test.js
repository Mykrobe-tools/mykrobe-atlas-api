import mapper from "../../modules/mapper";

describe("mapper", () => {
  describe("#transform", () => {
    const item = [
      "16.0617190",
      "Birmingham",
      "UK",
      "Delhi",
      "ERR2512416",
      "",
      "R",
      "S",
      "S",
      "R",
      "S",
      "S",
      "S",
      "R"
    ];
    const json = Object.assign({}, item);
    it("should map the metadata", () => {
      const result = mapper.transform(json);
      expect(result.metadata).toBeTruthy();
      const metadata = result.metadata;
      expect(metadata.sample.cityIsolate).toEqual("Birmingham");
      expect(metadata.sample.countryIsolate).toEqual("UK");
    });
    it("should map the metadata phenotyping", () => {
      const result = mapper.transform(json);
      expect(result.metadata).toBeTruthy();
      const metadata = result.metadata;
      expect(metadata.phenotyping.isoniazid.susceptibility).toEqual(
        "Not tested"
      );
      expect(metadata.phenotyping.rifampicin.susceptibility).toEqual(
        "Resistant"
      );
      expect(metadata.phenotyping.ethambutol.susceptibility).toEqual(
        "Sensitive"
      );
      expect(metadata.phenotyping.pyrazinamide.susceptibility).toEqual(
        "Sensitive"
      );
    });
    it("should map the predictor results", () => {
      const result = mapper.transform(json);
      expect(result.results).toBeTruthy();
      expect(result.results.length).toEqual(1);
      const predictor = result.results[0];
      expect(predictor.type).toEqual("predictor");
      expect(predictor.analysed).toBeTruthy();
    });
    it("should map the susceptibility results", () => {
      const result = mapper.transform(json);
      expect(result.results).toBeTruthy();
      expect(result.results.length).toEqual(1);
      const susceptibility = result.results[0].susceptibility;
      expect(susceptibility.length).toEqual(4);
      expect(susceptibility[0].name).toEqual("Isoniazid");
      expect(susceptibility[0].prediction).toEqual("R");
      expect(susceptibility[1].name).toEqual("Rifampicin");
      expect(susceptibility[1].prediction).toEqual("S");
      expect(susceptibility[2].name).toEqual("Ethambutol");
      expect(susceptibility[2].prediction).toEqual("S");
      expect(susceptibility[3].name).toEqual("Pyrazinamide");
      expect(susceptibility[3].prediction).toEqual("S");
    });
    it("should map the phylogenetics results", () => {
      const result = mapper.transform(json);
      expect(result.results).toBeTruthy();
      expect(result.results.length).toEqual(1);
      const phylogenetics = result.results[0].phylogenetics;
      expect(phylogenetics.length).toEqual(4);
      expect(phylogenetics[0].type).toEqual("complex");
      expect(phylogenetics[0].result).toEqual(
        "Mycobacterium_tuberculosis_complex"
      );
      expect(phylogenetics[1].type).toEqual("sub-complex");
      expect(phylogenetics[1].result).toEqual(
        "subMycobacterium_tuberculosis_complex"
      );
      expect(phylogenetics[2].type).toEqual("species");
      expect(phylogenetics[2].result).toEqual("Mycobacterium_tuberculosis");
      expect(phylogenetics[3].type).toEqual("sub-species");
      expect(phylogenetics[3].result).toEqual("Delhi_Central_Asia");
    });
  });
});

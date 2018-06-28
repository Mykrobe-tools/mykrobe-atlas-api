import Metadata from "../../models/metadata.model";

require("../setup");
const metadata = require("../fixtures/metadata");

let id = null;

beforeEach(async done => {
  const metadataData = new Metadata(metadata.sample1);
  const savedMetadata = await metadataData.save();
  id = savedMetadata.id;
  done();
});

afterEach(async done => {
  await Metadata.remove({});
  done();
});

describe("## Metadata Functions", () => {
  it("should save a new metadata", async done => {
    const metadataData = new Metadata(metadata.sample1);
    const savedMetadata = await metadataData.save();
    expect(savedMetadata.patientId).toEqual("12345");
    expect(savedMetadata.siteId).toEqual("abc");
    expect(savedMetadata.genderAtBirth).toEqual("Male");
    expect(savedMetadata.countryOfBirth).toEqual("Hong Kong");
    expect(savedMetadata.bmi).toEqual(12);
    expect(savedMetadata.injectingDrugUse).toEqual("notice");
    expect(savedMetadata.homeless).toEqual("Yes");
    expect(savedMetadata.imprisoned).toEqual("Yes");
    expect(savedMetadata.smoker).toEqual("No");
    expect(savedMetadata.diabetic).toEqual("Yes");
    expect(savedMetadata.hivStatus).toEqual("Negative");
    done();
  });
  it("should fetch the metadata by id", async done => {
    const foundMetadata = await Metadata.get(id);
    expect(foundMetadata.patientId).toEqual("12345");
    expect(foundMetadata.siteId).toEqual("abc");
    expect(foundMetadata.genderAtBirth).toEqual("Male");
    expect(foundMetadata.countryOfBirth).toEqual("Hong Kong");
    expect(foundMetadata.bmi).toEqual(12);
    expect(foundMetadata.injectingDrugUse).toEqual("notice");
    expect(foundMetadata.homeless).toEqual("Yes");
    expect(foundMetadata.imprisoned).toEqual("Yes");
    expect(foundMetadata.smoker).toEqual("No");
    expect(foundMetadata.diabetic).toEqual("Yes");
    expect(foundMetadata.hivStatus).toEqual("Negative");
    done();
  });
  it("should return an error if not found", async done => {
    try {
      await Metadata.get("58d3f3795d34d121805fdc61");
      fail();
    } catch (e) {
      expect(e.name).toEqual("ObjectNotFound");
      expect(e.message).toEqual(
        "Metadata not found with id 58d3f3795d34d121805fdc61"
      );
      done();
    }
  });
  it("should transform experiment it to json", async done => {
    const foundMetadata = await Metadata.get(id);
    const json = foundMetadata.toJSON();
    expect(json.patientId).toEqual("12345");
    expect(json.siteId).toEqual("abc");
    expect(json.genderAtBirth).toEqual("Male");
    expect(json.countryOfBirth).toEqual("Hong Kong");
    expect(json.bmi).toEqual(12);
    expect(json.injectingDrugUse).toEqual("notice");
    expect(json.homeless).toEqual("Yes");
    expect(json.imprisoned).toEqual("Yes");
    expect(json.smoker).toEqual("No");
    expect(json.diabetic).toEqual("Yes");
    expect(json.hivStatus).toEqual("Negative");
    done();
  });
});

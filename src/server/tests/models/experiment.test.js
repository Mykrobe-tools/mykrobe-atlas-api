import Experiment from "../../models/experiment.model";
import Organisation from "../../models/organisation.model";

require("../setup");
const experiments = require("../fixtures/experiments");

let id = null;

beforeEach(async done => {
  const experimentData = new Experiment(experiments.tbUploadMetadata);
  const experiment = await experimentData.save();
  id = experiment.id;
  done();
});

afterEach(async done => {
  await Experiment.remove({});
  await Organisation.remove({});
  done();
});

describe("## Experiment Functions", () => {
  it("should save a new experiment", async done => {
    const experimentData = new Experiment(experiments.tbUploadMetadataChinese);
    const experiment = await experimentData.save();

    expect(experiment.metadata).toHaveProperty("patient");
    expect(experiment.metadata).toHaveProperty("sample");
    expect(experiment.metadata).toHaveProperty("genotyping");
    expect(experiment.metadata).toHaveProperty("phenotyping");

    const patient = experiment.metadata.patient;
    expect(patient.patientId).toEqual("9bd049c5-7407-4129-a973-17291ccdd2cc");
    expect(patient.siteId).toEqual("ccc4e687-a094-4533-b136-c507fe00a9a8");
    expect(patient.genderAtBirth).toEqual("Female");
    expect(patient.countryOfBirth).toEqual("China");

    done();
  });
  it("should fetch the experiment by id", async done => {
    const experiment = await Experiment.get(id);

    const metadata = experiment.get("metadata");
    expect(metadata).toHaveProperty("patient");
    expect(metadata).toHaveProperty("sample");
    expect(metadata).toHaveProperty("genotyping");
    expect(metadata).toHaveProperty("phenotyping");

    const patient = metadata.patient;
    expect(patient.patientId).toEqual("eff2fa6a-9d79-41ab-a307-b620cedf7293");
    expect(patient.siteId).toEqual("a2a910e3-25ef-475c-bdf9-f6fe215d949f");
    expect(patient.genderAtBirth).toEqual("Male");
    expect(patient.countryOfBirth).toEqual("India");

    done();
  });
  it("should return an error if not found", async done => {
    try {
      await Experiment.get("58d3f3795d34d121805fdc61");
      fail();
    } catch (e) {
      expect(e.name).toEqual("ObjectNotFound");
      expect(e.message).toEqual(
        "Experiment not found with id 58d3f3795d34d121805fdc61"
      );
      done();
    }
  });
  it("should return the list of all experiments", async done => {
    const foundExperiments = await Experiment.list();
    expect(foundExperiments.length).toEqual(1);
    done();
  });
  it("should transform experiment it to json", async done => {
    const experiment = await Experiment.get(id);
    const json = experiment.toJSON();

    const metadata = json.metadata;
    expect(metadata).toHaveProperty("patient");
    expect(metadata).toHaveProperty("sample");
    expect(metadata).toHaveProperty("genotyping");
    expect(metadata).toHaveProperty("phenotyping");

    const patient = metadata.patient;
    expect(patient.patientId).toEqual("eff2fa6a-9d79-41ab-a307-b620cedf7293");
    expect(patient.siteId).toEqual("a2a910e3-25ef-475c-bdf9-f6fe215d949f");
    expect(patient.genderAtBirth).toEqual("Male");
    expect(patient.countryOfBirth).toEqual("India");
    done();
  });
});

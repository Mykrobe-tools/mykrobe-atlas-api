import Experiment from "../../models/experiment.model";
import Organisation from "../../models/organisation.model";

require("../setup");
const experiments = require("../fixtures/experiments");

let id = null;

beforeEach(async done => {
  const experimentData = new Experiment(experiments.tuberculosis);
  const organisationData = new Organisation(
    experiments.tuberculosis.organisation
  );
  const organisation = await organisationData.save();
  experimentData.organisation = organisation;
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
    const experimentData = new Experiment(experiments.pneumonia);
    const organisationData = new Organisation(experimentData.organisation);
    const organisation = await organisationData.save();
    experimentData.organisation = organisation;
    const experiment = await experimentData.save();
    expect(experiment.location.name).toEqual("India");
    expect(experiment.location.lat).toEqual(1.4);
    expect(experiment.jaccardIndex.version).toEqual("1.0");
    done();
  });
  it("should fetch the experiment by id", async done => {
    const experiment = await Experiment.get(id);
    expect(experiment.organisation.name).toEqual("Apex Entertainment");
    expect(experiment.location.name).toEqual("London");
    expect(experiment.location.lat).toEqual(3.4);
    expect(experiment.jaccardIndex.version).toEqual("1.0");
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
    expect(json.organisation.name).toEqual("Apex Entertainment");
    expect(json.location.name).toEqual("London");
    expect(json.location.lat).toEqual(3.4);
    expect(json.jaccardIndex.version).toEqual("1.0");
    done();
  });
});

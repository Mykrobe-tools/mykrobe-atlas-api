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

afterEach(() => Experiment.remove({}));

describe("ExperimentTransformer", () => {
  it("should fetch experiment by id", async () => {
    const foundExperiment = await Experiment.get(id);
    expect(foundExperiment.toJSON().location.name).toEqual("London");
    expect(foundExperiment.toJSON().snpDistance.version).toEqual("1.1");
    expect(foundExperiment.toJSON().jaccardIndex.version).toEqual("1.0");
  });
  it("should transform experiment to json", async () => {
    const foundExperiment = await Experiment.get(id);
    const json = foundExperiment.toJSON();
    expect(json.location.name).toEqual("London");
    expect(json.snpDistance.version).toEqual("1.1");
    expect(json.jaccardIndex.version).toEqual("1.0");
  });
  it("should transform nested organisation", async () => {
    const foundExperiment = await Experiment.get(id);
    const json = foundExperiment.toJSON();
    expect(json.organisation.name).toEqual("Apex Entertainment");
    expect(json.organisation.template).toEqual("MODS");
  });
});

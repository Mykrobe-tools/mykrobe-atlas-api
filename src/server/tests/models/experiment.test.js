import chai, { expect } from "chai";
import dirtyChai from "dirty-chai";
import Experiment from "../../models/experiment.model";
import Organisation from "../../models/organisation.model";

require("../setup");
const experiments = require("../fixtures/experiments");

chai.config.includeStack = true;
chai.use(dirtyChai);
let id = null;

beforeEach(done => {
  const experimentData = new Experiment(experiments.tuberculosis);
  const organisationData = new Organisation(
    experiments.tuberculosis.organisation
  );
  organisationData.save().then(organisation => {
    experimentData.organisation = organisation;
    experimentData.save().then(experiment => {
      id = experiment.id;
      done();
    });
  });
});

afterEach(done => {
  Experiment.remove({}).then(() => {
    Organisation.remove({}, done);
  });
});

describe("## Experiment Functions", () => {
  it("should save a new experiment", done => {
    const experimentData = new Experiment(experiments.pneumonia);
    const organisationData = new Organisation(experimentData.organisation);
    organisationData.save().then(organisation => {
      experimentData.organisation = organisation;
      experimentData.save().then(experiment => {
        expect(experiment.location.name).to.equal("India");
        expect(experiment.location.lat).to.equal(1.4);
        expect(experiment.jaccardIndex.version).to.equal("1.0");
        done();
      });
    });
  });
  it("should fetch the experiment by id", done => {
    Experiment.get(id).then(experiment => {
      expect(experiment.organisation.name).to.equal("Apex Entertainment");
      expect(experiment.location.name).to.equal("London");
      expect(experiment.location.lat).to.equal(3.4);
      expect(experiment.jaccardIndex.version).to.equal("1.0");
      done();
    });
  });
  it("should return an error if not found", done => {
    Experiment.get("58d3f3795d34d121805fdc61").catch(e => {
      expect(e.name).to.equal("ObjectNotFound");
      expect(e.message).to.equal(
        "Experiment not found with id 58d3f3795d34d121805fdc61"
      );
      done();
    });
  });
  it("should return the list of all experiments", done => {
    Experiment.list().then(foundExperiments => {
      expect(foundExperiments.length).to.equal(1);
      done();
    });
  });
  it("should transform experiment it to json", done => {
    Experiment.get(id).then(experiment => {
      const json = experiment.toJSON();
      expect(json.organisation.name).to.equal("Apex Entertainment");
      expect(json.location.name).to.equal("London");
      expect(json.location.lat).to.equal(3.4);
      expect(json.jaccardIndex.version).to.equal("1.0");
      done();
    });
  });
});

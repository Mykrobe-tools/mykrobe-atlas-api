import setup from "../setup";

import Experiment from "../../src/server/models/experiment.model";
import Organisation from "../../src/server/models/organisation.model";
import User from "../../src/server/models/user.model";

const users = require("../fixtures/users");
const experiments = require("../fixtures/experiments");

let id = null;
let savedExperiment = null;
let user = null;

beforeEach(async done => {
  const experimentData = new Experiment(experiments.tbUploadMetadata);
  try {
    savedExperiment = await experimentData.save();
    id = savedExperiment.id;

    done();
  } catch (e) {
    done(e);
  }
});

afterEach(async done => {
  await Experiment.remove({});
  await Organisation.remove({});
  await User.remove({});
  done();
});

describe("Experiment", () => {
  describe("#save", () => {
    describe("when valid data", () => {
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
    });
    describe("when isolate country has changed", () => {
      it("should update location", async done => {
        const experiment = await Experiment.get(id);
        experiment.set("metadata.sample.countryIsolate", "MX");
        experiment.set("metadata.sample.cityIsolate", "Puebla");

        const updated = await experiment.save();
        expect(updated.metadata.sample.latitudeIsolate).toEqual(19.0414398);
        expect(updated.metadata.sample.longitudeIsolate).toEqual(-98.2062727);

        done();
      });
    });
    describe("when isolate city has changed", () => {
      it("should update location", async done => {
        const experiment = await Experiment.get(id);
        experiment.set("metadata.sample.cityIsolate", "Chennai");

        const updated = await experiment.save();
        expect(updated.metadata.sample.latitudeIsolate).toEqual(13.0826802);
        expect(updated.metadata.sample.longitudeIsolate).toEqual(80.2707184);

        done();
      });
    });
    describe("when neither isolate country or city have changed", () => {
      it("should update location", async done => {
        const experiment = await Experiment.get(id);
        expect(experiment.metadata.sample.latitudeIsolate).toEqual(19.0759837);
        expect(experiment.metadata.sample.longitudeIsolate).toEqual(72.8776559);

        experiment.metadata.sample.sampleId = "13513871321";
        const updated = await experiment.save();
        expect(updated.metadata.sample.sampleId).toEqual("13513871321");
        expect(updated.metadata.sample.latitudeIsolate).toEqual(19.0759837);
        expect(updated.metadata.sample.longitudeIsolate).toEqual(72.8776559);

        done();
      });
    });
  });
  describe("#get", () => {
    describe("when the experiment exists", () => {
      it("should return the experiment", async done => {
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
    });
    describe("when the experiment does not exist", () => {
      it("should return an error imessage", async done => {
        try {
          await Experiment.get("58d3f3795d34d121805fdc61");
          fail();
        } catch (e) {
          expect(e.name).toEqual("ObjectNotFound");
          expect(e.message).toEqual("Experiment not found with id 58d3f3795d34d121805fdc61");
          done();
        }
      });
    });
  });
  describe("list", () => {
    describe("when experiments exist", () => {
      it("should return the list of all experiments", async done => {
        const foundExperiments = await Experiment.list();
        expect(foundExperiments.length).toEqual(1);
        done();
      });
    });
    describe("when experiments do not exist", () => {
      beforeEach(async done => {
        await Experiment.remove({});
        await Organisation.remove({});
        done();
      });
      it("should return an empty array", async done => {
        const foundExperiments = await Experiment.list();
        expect(foundExperiments.length).toEqual(0);
        expect(foundExperiments).toEqual([]);
        done();
      });
    });
  });
  describe("#toJSON", () => {
    it("should transform core experiment details", async done => {
      const experiment = await Experiment.get(id);
      const json = experiment.toJSON();

      expect(json.id).toBeTruthy();
      expect(json.created).toBeTruthy();
      expect(json.modified).toBeTruthy();
      done();
    });
    it("should transform experiment the experiment owner", async done => {
      const experiment = await Experiment.get(id);

      const userData = new User(users.thomas);
      user = await userData.save();

      experiment.owner = user;
      const json = experiment.toJSON();

      expect(json).toHaveProperty("owner");
      const owner = json.owner;

      expect(owner).toHaveProperty("firstname", "Thomas");
      expect(owner).toHaveProperty("lastname", "Carlos");
      expect(owner).toHaveProperty("phone", "07737929442");
      expect(owner).toHaveProperty("email", "thomas.carlos@nhs.net");

      done();
    });
    it("should transform experiment metadata", async done => {
      const experiment = await Experiment.get(id);
      const json = experiment.toJSON();

      const metadata = json.metadata;

      expect(metadata).toHaveProperty("patient");
      const patient = metadata.patient;

      expect(patient).toHaveProperty("patientId");
      expect(patient.patientId).toBeTruthy();
      expect(patient).toHaveProperty("siteId");
      expect(patient.siteId).toBeTruthy();
      expect(patient).toHaveProperty("genderAtBirth", "Male");
      expect(patient).toHaveProperty("countryOfBirth", "India");
      expect(patient).toHaveProperty("age", 43);
      expect(patient).toHaveProperty("bmi", 25.3);
      expect(patient).toHaveProperty("injectingDrugUse", "No");
      expect(patient).toHaveProperty("homeless", "No");
      expect(patient).toHaveProperty("imprisoned", "No");
      expect(patient).toHaveProperty("smoker", "Yes");
      expect(patient).toHaveProperty("diabetic", "Insulin");
      expect(patient).toHaveProperty("hivStatus", "Not tested");

      expect(metadata).toHaveProperty("sample");
      const sample = metadata.sample;
      expect(sample.labId).toBeTruthy();
      expect(sample).toHaveProperty("collectionDate");
      expect(sample.collectionDate.toJSON()).toEqual("2018-10-19T00:00:00.000Z");
      expect(sample).toHaveProperty("prospectiveIsolate", "Yes");
      expect(sample).toHaveProperty("countryIsolate", "IN");
      expect(sample).toHaveProperty("cityIsolate", "Mumbai");
      expect(sample).toHaveProperty("dateArrived");
      expect(sample.dateArrived.toJSON()).toEqual("2018-09-01T00:00:00.000Z");
      expect(sample).toHaveProperty("anatomicalOrigin", "Respiratory");
      expect(sample).toHaveProperty("smear", "Not known");

      expect(metadata).toHaveProperty("genotyping");
      const genotyping = metadata.genotyping;
      expect(genotyping).toHaveProperty("wgsPlatform", "MiSeq");
      expect(genotyping).toHaveProperty("otherGenotypeInformation", "Yes");
      expect(genotyping).toHaveProperty("genexpert", "Not tested");
      expect(genotyping).toHaveProperty("hainRif", "RIF resistant");
      expect(genotyping).toHaveProperty("hainInh", "INH sensitive");
      expect(genotyping).toHaveProperty("hainFl", "Not tested");
      expect(genotyping).toHaveProperty("hainAm", "Not tested");
      expect(genotyping).toHaveProperty("hainEth", "Not tested");

      expect(metadata).toHaveProperty("phenotyping");
      const phenotyping = metadata.phenotyping;
      expect(phenotyping).toHaveProperty("phenotypeInformationFirstLineDrugs", "Yes");
      expect(phenotyping).toHaveProperty("phenotypeInformationOtherDrugs", "No");
      expect(phenotyping).toHaveProperty("rifampicin");
      expect(phenotyping.rifampicin).toHaveProperty("susceptibility", "Resistant");
      expect(phenotyping.rifampicin).toHaveProperty("method", "Not known");
      expect(phenotyping).toHaveProperty("ethambutol");
      expect(phenotyping.ethambutol).toHaveProperty("susceptibility", "Sensitive");
      expect(phenotyping.ethambutol).toHaveProperty("method", "Not known");
      expect(phenotyping).toHaveProperty("pyrazinamide");
      expect(phenotyping.pyrazinamide).toHaveProperty("susceptibility", "Sensitive");
      expect(phenotyping.pyrazinamide).toHaveProperty("method", "Not known");
      expect(phenotyping).toHaveProperty("isoniazid");
      expect(phenotyping.isoniazid).toHaveProperty("susceptibility", "Sensitive");
      expect(phenotyping.isoniazid).toHaveProperty("method", "Not known");

      done();
    });
    describe("when the experiement has results", () => {
      it("should transform experiment results", async done => {
        const experimentDataWithResults = new Experiment(experiments.tbUploadMetadataResults);
        const savedExperimentWithResults = await experimentDataWithResults.save();

        const json = savedExperimentWithResults.toJSON();

        expect(json.results).toBeTruthy();
        const results = json.results;
        expect(results).toHaveProperty("distance-nearest-neighbour");
        expect(results["distance-nearest-neighbour"]).toBeTruthy();
        expect(results).toHaveProperty("distance-tree-distance");
        expect(results["distance-tree-distance"]).toBeTruthy();

        done();
      });
    });
  });
  describe("#findByIds", () => {
    describe("when there are matching experiments", () => {
      it("should find experiments by ids", async done => {
        const ids = [id];
        const experiments = await Experiment.findByIds(ids);

        const experiment = experiments[0];

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
    });
    describe("when there are no matching experiments", () => {
      it("should return an empty array", async done => {
        const ids = ["non-existant-experiment-id"];
        const experiments = await Experiment.findByIds(ids);

        expect(experiments.length).toEqual(0);
        expect(experiments).toEqual([]);

        done();
      });
    });
  });
  describe("#findByIsolateIds", () => {
    describe("when there are matching experiments", () => {
      it("should return matching experiments", async done => {
        const savedMetadata = savedExperiment.get("metadata");
        const isolateIds = [savedMetadata.sample.isolateId];

        const experiments = await Experiment.findByIsolateIds(isolateIds);

        const experiment = experiments[0];

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
    });
    describe("when there are no matching experiments", () => {
      it("should return an empty array", async done => {
        const savedMetadata = savedExperiment.get("metadata");
        const isolateIds = ["non-existant-isolate-id"];

        const experiments = await Experiment.findByIsolateIds(isolateIds);

        expect(experiments.length).toEqual(0);
        expect(experiments).toEqual([]);

        done();
      });
    });
  });
});

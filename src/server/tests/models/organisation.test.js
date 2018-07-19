import Organisation from "../../models/organisation.model";

require("../setup");
const organisations = require("../fixtures/organisations");

let id = null;

beforeEach(async done => {
  const organisationData = new Organisation(organisations.apex);
  const savedOrganisation = await organisationData.save();
  id = savedOrganisation.id;
  done();
});

afterEach(done => {
  Organisation.remove({}, done);
});

describe("## Organisations Functions", () => {
  it("should save a new organisation", async done => {
    const organisationData = new Organisation(organisations.diagnostics);
    const savedOrganisation = await organisationData.save();
    expect(savedOrganisation.name).toEqual("Diagnostic systems");
    done();
  });
  it("should fetch the organisation by id", async done => {
    const foundOrganisation = await Organisation.get(id);
    expect(foundOrganisation.name).toEqual("Apex Entertainment");
    done();
  });
  it("should return an error if not found", async done => {
    try {
      await Organisation.get("58d3f3795d34d121805fdc61");
      fail();
    } catch (e) {
      expect(e.name).toEqual("ObjectNotFound");
      expect(e.message).toEqual(
        "Organisation not found with id 58d3f3795d34d121805fdc61"
      );
      done();
    }
  });
  it("should transform organisation to json", async done => {
    const foundOrganisation = await Organisation.get(id);
    const json = foundOrganisation.toJSON();
    expect(json.name).toEqual("Apex Entertainment");
    done();
  });
  it("should list all organisations", async done => {
    const organisations = await Organisation.list();
    expect(organisations.length).toEqual(1);
    expect(organisations[0].name).toEqual("Apex Entertainment");
    done();
  });
});

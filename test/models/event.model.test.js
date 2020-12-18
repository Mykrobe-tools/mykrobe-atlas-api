import Event from "../../src/server/models/event.model";
import User from "../../src/server/models/user.model";

import setup from "../setup";

import events from "../fixtures/events";
import users from "../fixtures/users";

describe("Event", () => {
  let event,
    user = null;
  beforeEach(async done => {
    const eventData = new Event(events.valid);
    const userData = new User(users.thomas);
    user = await userData.save();
    eventData.userId = user.id;
    event = await eventData.save();

    done();
  });
  afterEach(async done => {
    await Event.deleteMany({});
    await User.deleteMany({});
    done();
  });

  describe("#save", () => {
    describe("with valid data", () => {
      it("should save the event", async done => {
        expect(event.openUploads.length).toEqual(1);
        expect(event.openSearches.length).toEqual(0);
        expect(event.openAnalysis.length).toEqual(0);

        done();
      });
      it("should save the event properties", async done => {
        const openUpload = event.openUploads[0];
        expect(openUpload.identifier).toEqual("329819623-INH_monoresistantfastq2gz");
        expect(openUpload.chunkNumber).toEqual("6");
        expect(openUpload.totalChunks).toEqual("314");
        expect(openUpload.chunkSize).toEqual(1048576);
        expect(openUpload.totalSize).toEqual(329819623);
        expect(openUpload.filename).toEqual("INH_monoresistant.fastq2.gz");
        expect(openUpload.type).toEqual("application/x-gzip");
        expect(openUpload.checksum).toEqual("6c6044328568d7814c54fe68de47e9a7");
        expect(openUpload.complete).toEqual(false);
        expect(openUpload.verifiedTotalChunks).toEqual(314);
        expect(openUpload.percentageComplete).toEqual(1.910828025477707);
        expect(openUpload.message).toEqual("Chunk 6 uploaded");

        done();
      });

      it("should save the event against the user", async done => {
        expect(event.userId).toEqual(user.id);

        done();
      });
    });
  });
  describe("#getByUserId", () => {
    describe("when the user id exists", () => {
      it("should return the event", async done => {
        const match = await Event.getByUserId(user.id);
        expect(match).toBeTruthy();
        done();
      });
    });
    describe("when the user does not exist", () => {
      it("should return null", async done => {
        const match = await Event.getByUserId("missing");
        expect(match).toBeFalsy();
        done();
      });
    });
  });
  describe("#list", () => {
    it("should list all the events", async done => {
      const list = await Event.list();
      expect(list.length).toEqual(1);
      done();
    });
  });
  describe("#toJSON", () => {
    it("return core event details", async done => {
      const foundEvent = await Event.getByUserId(user.id);
      const json = foundEvent.toJSON();
      expect(json.openUploads[0].identifier).toEqual("329819623-INH_monoresistantfastq2gz");
      done();
    });
  });
});

import { MongoClient } from "mongodb";
import mongoose from "mongoose";

import Event from "./event.model";
import User from "./user.model";

import Events from "./__fixtures__/Events";
import Users from "./__fixtures__/Users";

const args = {
  user: null,
  event: null,
  client: null
};

beforeAll(async done => {
  // db: Use in-memory db for tests
  args.client = await MongoClient.connect(global.__MONGO_URI__, {});
  await args.client.db(global.__MONGO_DB_NAME__);
  await mongoose.connect(global.__MONGO_URI__, {});

  done();
});

beforeEach(async done => {
  const eventData = new Event(Events.valid.event);
  const userData = new User(Users.valid.thomas);
  args.user = await userData.save();
  eventData.userId = args.user.id;
  args.event = await eventData.save();

  done();
});
afterEach(async done => {
  await Event.deleteMany({});
  await User.deleteMany({});
  done();
});

describe("Event", () => {
  describe("#save", () => {
    describe("when valid", () => {
      it("should save the event", async done => {
        expect(args.event.openUploads.length).toEqual(1);
        expect(args.event.openSearches.length).toEqual(0);
        expect(args.event.openAnalysis.length).toEqual(0);

        done();
      });
      it("should save the event properties", async done => {
        const openUpload = args.event.openUploads[0];
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
        expect(args.event.userId).toEqual(args.user.id);

        done();
      });
    });
  });
  describe("#getByUserId", () => {
    describe("when valid", () => {
      describe("when the user id exists", () => {
        it("should return the event object", async done => {
          const match = await Event.getByUserId(args.user.id);
          expect(match).toBeTruthy();
          done();
        });
      });
    });
    describe("when not valid", () => {
      describe("when the user does not exist", () => {
        it("should return null", async done => {
          const match = await Event.getByUserId("missing");
          expect(match).toBeFalsy();
          done();
        });
      });
    });
  });
  describe("#list", () => {
    describe("when valid", () => {
      describe("when events exist", () => {
        it("should list all the events", async done => {
          const list = await Event.list();
          expect(list.length).toEqual(1);
          done();
        });
      });
    });
  });
  describe("#toJSON", () => {
    describe("when valid", () => {
      it("should return core event details", async done => {
        const foundEvent = await Event.getByUserId(args.user.id);
        const json = foundEvent.toJSON();
        expect(json.openUploads[0].identifier).toEqual("329819623-INH_monoresistantfastq2gz");
        done();
      });
    });
  });
});

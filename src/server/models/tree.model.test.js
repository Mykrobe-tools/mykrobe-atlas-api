import { MongoClient } from "mongodb";
import mongoose from "mongoose";

import moment from "moment";

import Tree from "./tree.model";

import Trees from "./__fixtures__/Trees";

const args = {
  id: null,
  tree: null,
  client: null
};

beforeAll(async done => {
  // db: Use in-memory db for tests
  args.client = await MongoClient.connect(global.__MONGO_URI__, {});
  await args.client.db(global.__MONGO_DB_NAME__);
  await mongoose.connect(global.__MONGO_URI__, {});

  done();
});

beforeEach(async () => {
  const treeData = new Tree(Trees.valid.activeResult);
  const expiryDate = new moment().add(1, "month");
  treeData.expires = expiryDate.toISOString();

  args.tree = await treeData.save();
  args.id = args.tree.id;
});

afterEach(async () => {
  await Tree.deleteMany({});
});

describe("Tree", () => {
  describe("#save", () => {
    describe("when valid", () => {
      it("should save a new tree", async done => {
        const treeData = new Tree({
          expires: new Date(),
          tree: "(C00013131:0.00000384633470874880,10010-03:):0.0;0",
          version: "1.0"
        });
        try {
          const savedTree = await treeData.save();

          expect(savedTree.id).toBeTruthy();
          expect(savedTree.expires).toBeTruthy();
          expect(savedTree.tree).toEqual("(C00013131:0.00000384633470874880,10010-03:):0.0;0");
          expect(savedTree.version).toEqual("1.0");
          expect(savedTree.type).toEqual("newick");
        } catch (e) {
          fail();
        }

        done();
      });
    });
  });
  describe("#get", () => {
    describe("when valid", () => {
      describe("when a tree is currently stored", () => {
        it("should return the stored tree", async done => {
          const foundTree = await Tree.get();

          expect(foundTree.id).toBeTruthy();
          expect(foundTree.expires).toBeTruthy();
          expect(foundTree.tree).toEqual(
            "((6792-05:0.00000092410001012564,3160-04:0.00000081736801752172)"
          );
          expect(foundTree.version).toEqual("1.0");
          expect(foundTree.type).toEqual("newick");

          done();
        });
        it("should return transformed json", async done => {
          const foundTree = await Tree.get();
          const json = foundTree.toJSON();

          expect(json.id).toBeTruthy();
          expect(json.expires).toBeTruthy();
          expect(json.tree).toEqual(
            "((6792-05:0.00000092410001012564,3160-04:0.00000081736801752172)"
          );
          expect(json.version).toEqual("1.0");
          expect(json.type).toEqual("newick");

          done();
        });
      });
    });
    describe("when not valid", () => {
      describe("when no tree is stored", () => {
        it("should return null", async done => {
          await Tree.deleteMany({});
          const foundTree = await Tree.get();
          expect(foundTree).toBe(null);

          done();
        });
      });
    });
  });
  describe("#updateAndSetExpiry", () => {
    describe("when valid", () => {
      it("should update the tree", async done => {
        const foundTree = await Tree.get();

        const updatedTree = await foundTree.updateAndSetExpiry({
          tree: "((6792-05:0.00000092410001012564,3160-04:0.00000081736801752173))",
          version: "1.1",
          expires: new Date()
        });

        expect(updatedTree.tree).toEqual(
          "((6792-05:0.00000092410001012564,3160-04:0.00000081736801752173))"
        );
        done();
      });
      describe("when not providing a TTL", () => {
        it("should save with the default TTL", async done => {
          const foundTree = await Tree.get();

          const updatedTree = await foundTree.updateAndSetExpiry({
            tree: "((6792-05:0.00000092410001012564,3160-04:0.00000081736801752172)",
            version: "1.1",
            expires: new Date()
          });

          const newExpirationDate = moment();
          newExpirationDate.add(1, "hours");

          expect(updatedTree.id).toEqual(foundTree.id);

          const expires = moment(updatedTree.expires);
          expect(expires.date()).toEqual(newExpirationDate.date());
          expect(expires.month()).toEqual(newExpirationDate.month());
          expect(expires.year()).toEqual(newExpirationDate.year());

          done();
        });
      });
      describe("when providing a TTL", () => {
        it("should save with the overriden TTL", async done => {
          const foundTree = await Tree.get();

          const updatedTree = await foundTree.updateAndSetExpiry(
            {
              tree: "((6792-05:0.00000092410001012564,3160-04:0.00000081736801752172)",
              version: "1.1",
              expires: new Date()
            },
            72
          );

          const newExpirationDate = moment();
          newExpirationDate.add(72, "hours");

          expect(updatedTree.id).toEqual(foundTree.id);

          const expires = moment(updatedTree.expires);
          expect(expires.date()).toEqual(newExpirationDate.date());
          expect(expires.month()).toEqual(newExpirationDate.month());
          expect(expires.year()).toEqual(newExpirationDate.year());

          done();
        });
      });
    });
  });
  describe("#isExpired", () => {
    describe("when the tree is active", () => {
      it("should return false", async done => {
        const foundTree = await Tree.get();
        const isExpired = foundTree.isExpired();

        expect(isExpired).toBe(false);

        done();
      });
    });
    describe("when the tree has expired", () => {
      it("should return true", async done => {
        await Tree.deleteMany({});
        const treeData = new Tree(Trees.valid.expiredResult);
        await treeData.save();

        const foundTree = await Tree.get();
        const isExpired = foundTree.isExpired();

        expect(isExpired).toEqual(true);

        done();
      });
    });
  });
  describe("#update", () => {
    describe("when valid", () => {
      describe("when a tree exists", () => {
        it("should update the stored tree", async done => {
          const foundTree = await Tree.get();

          const updatedTree = await foundTree.updateAndSetExpiry(
            {
              tree: "abcdabcd",
              version: "2.0"
            },
            2160
          );

          const newExpirationDate = moment();
          newExpirationDate.add(2160, "hours");

          expect(updatedTree.id).toEqual(foundTree.id);

          const expires = moment(updatedTree.expires);
          expect(expires.date()).toEqual(newExpirationDate.date());
          expect(expires.month()).toEqual(newExpirationDate.month());
          expect(expires.year()).toEqual(newExpirationDate.year());

          expect(updatedTree.tree).toEqual("abcdabcd");
          expect(updatedTree.version).toEqual("2.0");
          expect(updatedTree.type).toEqual("newick");

          done();
        });
      });
    });
  });
});

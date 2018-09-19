import Tree from "../../models/tree.model";

require("../setup");
const trees = require("../fixtures/trees");

beforeEach(async () => {
  const treeData = new Tree(trees.activeResult);
  treeData.expires.setMonth(treeData.expires.getMonth() + 1);
  const tree = await treeData.save();
});

afterEach(async () => {
  await Tree.remove({});
});

describe("## Tree Functions", () => {
  it("should save a new tree", async done => {
    const treeData = new Tree({
      expires: new Date(),
      result: {
        result: {
          tree: "(C00013131:0.00000384633470874880,10010-03:):0.0;0",
          version: "1.0"
        },
        type: "tree"
      }
    });
    try {
      const savedTree = await treeData.save();

      expect(savedTree.id).toBeTruthy();
      expect(savedTree.expires).toBeTruthy();
      expect(savedTree.result.result.tree).toEqual(
        "(C00013131:0.00000384633470874880,10010-03:):0.0;0"
      );
      expect(savedTree.result.result.version).toEqual("1.0");
      expect(savedTree.result.type).toEqual("tree");
    } catch (e) {
      console.log(e);
      fail();
    }

    done();
  });
  it("should get the latest tree from mongo", async done => {
    const foundTree = await Tree.get();

    expect(foundTree.id).toBeTruthy();
    expect(foundTree.expires).toBeTruthy();
    expect(foundTree.result.result.tree).toEqual(
      "((6792-05:0.00000092410001012564,3160-04:0.00000081736801752172)"
    );
    expect(foundTree.result.result.version).toEqual("1.0");
    expect(foundTree.result.type).toEqual("tree");

    done();
  });
  it("should return null if no tree found", async done => {
    await Tree.remove({});
    const foundTree = await Tree.get();
    expect(foundTree).toBe(null);

    done();
  });
  it("should transform tree to json", async done => {
    const foundTree = await Tree.get();
    const json = foundTree.toJSON();

    expect(json.id).toBeTruthy();
    expect(json.expires).toBeTruthy();
    expect(json.result.result.tree).toEqual(
      "((6792-05:0.00000092410001012564,3160-04:0.00000081736801752172)"
    );
    expect(json.result.result.version).toEqual("1.0");
    expect(json.result.type).toEqual("tree");

    done();
  });
  it("should update the tree", async done => {
    const foundTree = await Tree.get();

    const updatedTree = await foundTree.update(
      {
        result: {
          tree: "abcdabcd",
          version: "2.0"
        },
        type: "tree"
      },
      3
    );

    var newExpirationDate = new Date();
    newExpirationDate.setMonth(newExpirationDate.getMonth() + 3);

    expect(updatedTree.id).toEqual(foundTree.id);
    expect(updatedTree.expires.getDay()).toEqual(newExpirationDate.getDay());
    expect(updatedTree.expires.getMonth()).toEqual(
      newExpirationDate.getMonth()
    );
    expect(updatedTree.expires.getYear()).toEqual(newExpirationDate.getYear());
    expect(updatedTree.result.result.tree).toEqual("abcdabcd");
    expect(updatedTree.result.result.version).toEqual("2.0");
    expect(updatedTree.result.type).toEqual("tree");

    done();
  });

  it("should claculate isExpired for active result", async done => {
    const foundTree = await Tree.get();
    const isExpired = foundTree.isExpired();

    expect(isExpired).toBe(false);

    done();
  });

  it("should claculate isExpired for expired result", async done => {
    await Tree.remove({});
    const treeData = new Tree(trees.expiredResult);
    await treeData.save();

    const foundTree = await Tree.get();
    const isExpired = foundTree.isExpired();

    expect(isExpired).toBe(true);

    done();
  });
});

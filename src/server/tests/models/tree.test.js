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
      tree: "(C00013131:0.00000384633470874880,10010-03:):0.0;0",
      version: "1.0"
    });
    try {
      const savedTree = await treeData.save();

      expect(savedTree.id).toBeTruthy();
      expect(savedTree.expires).toBeTruthy();
      expect(savedTree.tree).toEqual(
        "(C00013131:0.00000384633470874880,10010-03:):0.0;0"
      );
      expect(savedTree.version).toEqual("1.0");
      expect(savedTree.type).toEqual("newick");
    } catch (e) {
      console.log(e.message);
      fail();
    }

    done();
  });
  it("should get the latest tree from mongo", async done => {
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
    expect(json.tree).toEqual(
      "((6792-05:0.00000092410001012564,3160-04:0.00000081736801752172)"
    );
    expect(json.version).toEqual("1.0");
    expect(json.type).toEqual("newick");

    done();
  });
  it("should update the tree", async done => {
    const foundTree = await Tree.get();

    const updatedTree = await foundTree.update(
      {
        tree: "abcdabcd",
        version: "2.0"
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
    expect(updatedTree.tree).toEqual("abcdabcd");
    expect(updatedTree.version).toEqual("2.0");
    expect(updatedTree.type).toEqual("newick");

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

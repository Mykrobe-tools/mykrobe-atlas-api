export default {
  valid: {
    distance: {
      type: "distance",
      leafId: "leaf_1208",
      result: [
        { sampleId: "8bc98496-9bf8-4111-a40f-5c99ac28e690", leafId: "leaf_1208", distance: 23 },
        { sampleId: "087efc5c-cffa-41dc-b671-5854861af144", leafId: "leaf_1208", distance: 12 }
      ]
    }
  },
  invalid: {
    distance: {
      errorState: {
        type: "distance",
        status: "error",
        leafId: "",
        result: []
      }
    }
  }
};

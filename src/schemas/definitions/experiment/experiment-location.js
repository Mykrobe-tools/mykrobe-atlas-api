const Location = {
  type: "object",
  title: "location",
  properties: {
    name: {
      title: "Name",
      type: "string"
    },
    lat: {
      title: "Latitude",
      type: "number"
    },
    lng: {
      title: "Longitude",
      type: "number"
    }
  },
  required: ["lat", "lng"]
};

export { Location };

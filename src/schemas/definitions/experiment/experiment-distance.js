const Distance = {
  type: "object",
  title: "distance",
  properties: {
    analysed: {
      title: "Analysed",
      type: "string",
      format: "date-time"
    },
    engine: {
      title: "Engine",
      type: "string"
    },
    version: {
      title: "Version",
      type: "string"
    }
  }
};

export { Distance };

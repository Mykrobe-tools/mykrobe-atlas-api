const GeoCache = {
  getLocation: jest.fn().mockImplementation(location => {
    switch (location) {
      case "":
        return null;
    }
    return null;
  })
};

export default GeoCache;

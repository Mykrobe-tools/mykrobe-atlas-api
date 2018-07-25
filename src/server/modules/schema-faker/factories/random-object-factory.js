import randomDataFactory from "./random-data-factory";

const create = object => {
  const sample = {};
  const properties = object.properties;
  if (properties) {
    Object.keys(properties).forEach(key => {
      const property = properties[key];
      sample[key] = randomDataFactory.create(property, key);
    });
  }
  return sample;
};

const randomObjectFactory = Object.freeze({
  create
});

export default randomObjectFactory;

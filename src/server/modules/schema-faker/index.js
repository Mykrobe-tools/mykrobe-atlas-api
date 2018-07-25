import randomDataFactory from "./factories/random-data-factory";

const sample = properties => {
  const sample = {};
  Object.keys(properties).forEach(key => {
    const object = properties[key];
    sample[key] = randomDataFactory.create(object, key);
  });
  return sample;
};

const schemaFaker = Object.freeze({
  sample
});

export default schemaFaker;

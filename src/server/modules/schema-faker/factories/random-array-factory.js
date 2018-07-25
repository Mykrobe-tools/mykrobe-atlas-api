import { getRandomArrayLength } from "../utils";
import randomDataFactory from "./random-data-factory";

const create = (object, fieldName) => {
  const arrayLength = getRandomArrayLength();
  const samples = [];
  for (let i=0; i<arrayLength; i++) {
    const sample = randomDataFactory.create(object.items, fieldName);
    samples.push(sample);
  }
  return samples;
};

const randomArrayFactory = Object.freeze({
  create
});

export default randomArrayFactory;

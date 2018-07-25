import numberGenerator from "../generators/number-generator";

const create = (object, fieldName) => {
  return numberGenerator.generate(fieldName);
};

const randomNumberFactory = Object.freeze({
  create
});

export default randomNumberFactory;

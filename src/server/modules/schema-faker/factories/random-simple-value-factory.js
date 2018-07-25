import randomStringFactory from "./random-string-factory";
import randomNumberFactory from "./random-number-factory";
import textGenerator from "../generators/text-generator";

const create = (object, fieldName) => {
  switch (object.type) {
    case "string":
      return randomStringFactory.create(object, fieldName);
    case "number":
      return randomNumberFactory.create(object, fieldName);
    default:
      return textGenerator.generate(fieldName);
  }
};

const randomSimpleValueFactory = Object.freeze({
  create
});

export default randomSimpleValueFactory;

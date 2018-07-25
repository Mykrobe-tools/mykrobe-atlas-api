import randomObjectFactory from "./random-object-factory";
import randomArrayFactory from "./random-array-factory";
import randomSimpleValueFactory from "./random-simple-value-factory";

const create = (object, fieldName) => {
  switch (object.type) {
    case "object":
      return randomObjectFactory.create(object);
    case "array":
      return randomArrayFactory.create(object, fieldName);
    default:
      return randomSimpleValueFactory.create(object, fieldName);
  }
};

const randomDataFactory = Object.freeze({
  create
});

export default randomDataFactory;

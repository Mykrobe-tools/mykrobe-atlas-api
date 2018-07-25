import textGenerator from "../generators/text-generator";
import choiceGenerator from "../generators/choice-generator";
import dateGenerator from "../generators/date-generator";
import dateTimeGenerator from "../generators/date-time-generator";

const create = (object, fieldName) => {
  if (object.enum) {
    return choiceGenerator.generate(object.enum);
  } else if (object.format && object.format === "date") {
    return dateGenerator.generate(fieldName);
  } else if (object.format && object.format === "date-time") {
    return dateTimeGenerator.generate(fieldName);
  }
  return textGenerator.generate(fieldName);
};

const randomStringFactory = Object.freeze({
  create
});

export default randomStringFactory;

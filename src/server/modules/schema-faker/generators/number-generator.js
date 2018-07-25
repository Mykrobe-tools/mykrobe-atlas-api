import faker from "faker";
import { getRandomAge, getRandomBMI, getRandomPercentage } from "../utils";

const generate = fieldName => {
  if (fieldName.toLowerCase().endsWith("age")) {
    return getRandomAge();
  } else if (fieldName.toLowerCase().endsWith("bmi")) {
    return getRandomBMI();
  } else if (fieldName.toLowerCase().indexOf("percent") > -1) {
    return getRandomPercentage();
  }
  return faker.random.number();
};

const numberGenerator = Object.freeze({
  generate
});

export default numberGenerator;

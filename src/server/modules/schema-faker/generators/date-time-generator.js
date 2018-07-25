import faker from "faker";
import { getRandomInt } from "../utils";

const generate = fieldName => {
  if (fieldName.toLowerCase().indexOf("stop") > -1) {
    return faker.date.future().toISOString();
  } else if (fieldName.toLowerCase().indexOf("start") > -1) {
    return faker.date.past().toISOString();
  } else if (fieldName.toLowerCase().indexOf("birth") > -1) {
    return faker.date.past(getRandomInt(12, 80)).toISOString();
  } else if (fieldName.toLowerCase().indexOf("death") > -1) {
    return faker.date.past(getRandomInt(1, 5)).toISOString();
  } else {
    return faker.date.past(1).toISOString();
  }
};

const dateTimeGenerator = Object.freeze({
  generate
});

export default dateTimeGenerator;

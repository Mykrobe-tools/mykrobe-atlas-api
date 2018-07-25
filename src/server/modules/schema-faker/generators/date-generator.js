import faker from "faker";
import { getRandomInt } from "../utils";

const generate = fieldName => {
  let d;
  if (fieldName.toLowerCase().indexOf("stop") > -1) {
    d = faker.date.future();
  } else if (fieldName.toLowerCase().indexOf("start") > -1) {
    d = faker.date.past();
  } else if (fieldName.toLowerCase().indexOf("birth") > -1) {
    d = faker.date.past(getRandomInt(12, 80));
  } else if (fieldName.toLowerCase().indexOf("death") > -1) {
    d = faker.date.past(getRandomInt(1, 5));
  } else {
    d = faker.date.past(1);
  }

  let month = `${(d.getMonth() + 1)}`,
      day = `${d.getDate()}`,
      year = `${d.getFullYear()}`;

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

const textGenerator = Object.freeze({
  generate
});

export default textGenerator;

import faker from "faker";

const generate = fieldName => {
  if (fieldName.toLowerCase().endsWith("file")) {
    return faker.system.fileName();
  } else if (fieldName.toLowerCase().endsWith("id")) {
    return faker.random.uuid();
  } else if (fieldName.toLowerCase().indexOf("email") > -1) {
    return faker.internet.email();
  } else if (fieldName.toLowerCase().endsWith("firstname")) {
    return faker.name.firstName();
  } else if (fieldName.toLowerCase().endsWith("lastname")) {
    return faker.name.lastName();
  }
  return faker.lorem.word();
};

const textGenerator = Object.freeze({
  generate
});

export default textGenerator;

import _ from "lodash";

const generate = choices => {
  return _.sample(choices);
};

const choiceGenerator = Object.freeze({
  generate
});

export default choiceGenerator;

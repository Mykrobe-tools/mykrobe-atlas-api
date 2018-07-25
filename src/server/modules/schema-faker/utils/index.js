const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min)) + min;

const getRandomAge = () => getRandomInt(10, 80);

const getRandomBMI = () => getRandomInt(1600, 3200)/100;

const getRandomArrayLength = () => getRandomInt(1, 5);

const getRandomPercentage = () => getRandomInt(100, 10000)/100;

const utils = Object.freeze({
  getRandomInt,
  getRandomAge,
  getRandomBMI,
  getRandomArrayLength,
  getRandomPercentage
});

export default utils;

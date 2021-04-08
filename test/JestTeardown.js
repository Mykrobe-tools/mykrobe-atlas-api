module.exports = async function() {
  console.log(`Stopping mongod ...`);
  await global.__MONGOD__.stop();
  console.log(`Mongod stopped`);
};

const runHomeRouteTest = require("./home-route.test");
const runTaskRepositoryTest = require("./task-repository.test");
const runTaskValidatorTest = require("./task-validator.test");

async function run() {
  await runHomeRouteTest();
  console.log("home route test passed");

  await runTaskRepositoryTest();
  console.log("task repository test passed");

  await runTaskValidatorTest();
  console.log("task validator test passed");
}

run().catch(function (error) {
  console.error(error);
  process.exitCode = 1;
});

const assert = require("node:assert/strict");

const taskValidator = require("../src/taskValidator");

async function run() {
  const validResult = taskValidator.validateTaskTitle("  Buy milk  ");
  const invalidResult = taskValidator.validateTaskTitle("x".repeat(101));

  assert.deepEqual(validResult, {
    isValid: true,
    trimmedTitle: "Buy milk",
    error: null
  });

  assert.deepEqual(invalidResult, {
    isValid: false,
    trimmedTitle: "x".repeat(101),
    error: "Task title cannot be longer than 100 characters."
  });
}

module.exports = run;

if (require.main === module) {
  run()
    .then(function () {
      console.log("task validator test passed");
    })
    .catch(function (error) {
      console.error(error);
      process.exitCode = 1;
    });
}

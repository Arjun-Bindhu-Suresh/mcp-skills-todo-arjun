const assert = require("assert");
const taskManager = require("../src/taskManager");

function testAddTask() {
  const tasks = [];
  const updatedTasks = taskManager.addTask(tasks, "Buy milk");

  assert.strictEqual(updatedTasks.length, 1);
  assert.strictEqual(updatedTasks[0].text, "Buy milk");
  assert.strictEqual(updatedTasks[0].completed, false);
}

function testIgnoreEmptyTask() {
  const tasks = [];
  const updatedTasks = taskManager.addTask(tasks, "   ");

  assert.strictEqual(updatedTasks.length, 0);
}

function testToggleTask() {
  const originalTask = { id: "1", text: "Read book", completed: false };
  const updatedTasks = taskManager.toggleTask([originalTask], "1");

  assert.strictEqual(updatedTasks[0].completed, true);
}

function testDeleteTask() {
  const tasks = [
    { id: "1", text: "Task one", completed: false },
    { id: "2", text: "Task two", completed: false }
  ];
  const updatedTasks = taskManager.deleteTask(tasks, "1");

  assert.strictEqual(updatedTasks.length, 1);
  assert.strictEqual(updatedTasks[0].id, "2");
}

testAddTask();
testIgnoreEmptyTask();
testToggleTask();
testDeleteTask();

console.log("All task manager tests passed.");

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const createTaskRepository = require("../src/taskRepository");

async function run() {
  await testInitializesMissingFile();
  await testCreateToggleRemoveAndInsertionOrder();
  await testCorruptJsonFailsSafely();
}

async function testInitializesMissingFile() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "todo-repo-test-"));
  const filePath = path.join(tempDir, "tasks.json");
  const repository = createTaskRepository({ filePath: filePath });

  try {
    const tasks = await repository.getAll();
    const savedFile = await fs.readFile(filePath, "utf8");

    assert.deepEqual(tasks, []);
    assert.equal(savedFile, "[]");
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function testCreateToggleRemoveAndInsertionOrder() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "todo-repo-test-"));
  const filePath = path.join(tempDir, "tasks.json");
  const repository = createTaskRepository({ filePath: filePath });

  try {
    const firstTask = await repository.create("First task");
    const secondTask = await repository.create("Second task");
    const tasksAfterCreate = await repository.getAll();

    assert.equal(tasksAfterCreate.length, 2);
    assert.equal(tasksAfterCreate[0].title, "First task");
    assert.equal(tasksAfterCreate[1].title, "Second task");
    assert.equal(tasksAfterCreate[0].completed, false);
    assert.match(tasksAfterCreate[0].id, /.+/);
    assert.match(tasksAfterCreate[0].createdAt, /.+/);

    const toggled = await repository.toggle(firstTask.id);
    const tasksAfterToggle = await repository.getAll();

    assert.equal(toggled, true);
    assert.equal(tasksAfterToggle[0].completed, true);
    assert.equal(tasksAfterToggle[1].completed, false);

    const removed = await repository.remove(secondTask.id);
    const tasksAfterRemove = await repository.getAll();

    assert.equal(removed, true);
    assert.equal(tasksAfterRemove.length, 1);
    assert.equal(tasksAfterRemove[0].id, firstTask.id);

    const missingToggle = await repository.toggle("missing-id");
    const missingRemove = await repository.remove("missing-id");

    assert.equal(missingToggle, false);
    assert.equal(missingRemove, false);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function testCorruptJsonFailsSafely() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "todo-repo-test-"));
  const filePath = path.join(tempDir, "tasks.json");
  const repository = createTaskRepository({ filePath: filePath });

  try {
    await fs.writeFile(filePath, "{not valid json", "utf8");

    await assert.rejects(
      repository.getAll(),
      function (error) {
        assert.equal(error.name, "TaskRepositoryError");
        assert.equal(error.message, "Could not read tasks.");
        return true;
      }
    );
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

module.exports = run;

if (require.main === module) {
  run()
    .then(function () {
      console.log("task repository test passed");
    })
    .catch(function (error) {
      console.error(error);
      process.exitCode = 1;
    });
}

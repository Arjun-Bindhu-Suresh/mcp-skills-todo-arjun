const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const createApp = require("../src/serverApp");
const createTaskRepository = require("../src/taskRepository");

async function run() {
  await testGetHomePage();
  await testInvalidTaskSubmission();
  await testTooLongTaskSubmission();
  await testValidTaskSubmissionRedirectsAndPersistsTask();
  await testToggleTaskCompletionRedirectsAndUpdatesRendering();
  await testDeleteTaskRedirectsAndRemovesTaskFromList();
}

async function testGetHomePage() {
  const app = createApp();
  const server = app.listen(0);

  try {
    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/`);
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.match(html, /<title>Express To-Do App<\/title>/);
    assert.match(html, /<h1[^>]*>To-Do List<\/h1>/);
    assert.match(html, /<form[^>]*action="\/tasks"[^>]*method="post"/i);
    assert.match(html, /placeholder="Enter a task"/i);
    assert.match(html, /No tasks yet\. Add one above\./);
  } finally {
    await new Promise(function (resolve, reject) {
      server.close(function (error) {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

async function testInvalidTaskSubmission() {
  const app = createApp();
  const server = app.listen(0);

  try {
    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "title=%20%20%20"
    });
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.match(html, /Task title cannot be empty\./);
    assert.match(html, /value="   "/);
    assert.match(html, /No tasks yet\. Add one above\./);
  } finally {
    await new Promise(function (resolve, reject) {
      server.close(function (error) {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

async function testTooLongTaskSubmission() {
  const app = createApp();
  const server = app.listen(0);
  const longTitle = "x".repeat(101);

  try {
    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `title=${longTitle}`
    });
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.match(html, /Task title cannot be longer than 100 characters\./);
    assert.match(html, new RegExp(`value="${longTitle}"`));
  } finally {
    await new Promise(function (resolve, reject) {
      server.close(function (error) {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

async function testValidTaskSubmissionRedirectsAndPersistsTask() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "todo-app-test-"));
  const repository = createTaskRepository({
    filePath: path.join(tempDir, "tasks.json")
  });
  const app = createApp({ taskRepository: repository });
  const server = app.listen(0);

  try {
    const address = server.address();
    const createResponse = await fetch(`http://127.0.0.1:${address.port}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "title=Buy%20milk",
      redirect: "manual"
    });

    assert.equal(createResponse.status, 302);
    assert.equal(createResponse.headers.get("location"), "/");

    const homeResponse = await fetch(`http://127.0.0.1:${address.port}/`);
    const html = await homeResponse.text();

    assert.equal(homeResponse.status, 200);
    assert.match(html, /Buy milk/);
    assert.doesNotMatch(html, /No tasks yet\. Add one above\./);
  } finally {
    await new Promise(function (resolve, reject) {
      server.close(function (error) {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function testToggleTaskCompletionRedirectsAndUpdatesRendering() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "todo-app-test-"));
  const repository = createTaskRepository({
    filePath: path.join(tempDir, "tasks.json")
  });
  const createdTask = await repository.create("Read book");
  const app = createApp({ taskRepository: repository });
  const server = app.listen(0);

  try {
    const address = server.address();
    const toggleResponse = await fetch(
      `http://127.0.0.1:${address.port}/tasks/${createdTask.id}/toggle`,
      {
        method: "POST",
        redirect: "manual"
      }
    );

    assert.equal(toggleResponse.status, 302);
    assert.equal(toggleResponse.headers.get("location"), "/");

    const homeResponse = await fetch(`http://127.0.0.1:${address.port}/`);
    const html = await homeResponse.text();
    const tasks = await repository.getAll();

    assert.equal(homeResponse.status, 200);
    assert.equal(tasks[0].completed, true);
    assert.match(
      html,
      /<li[^>]*class="task-item task-item-completed"[^>]*>[\s\S]*Read book[\s\S]*Uncomplete/i
    );
    assert.match(
      html,
      new RegExp(`<form[^>]*action="/tasks/${createdTask.id}/toggle"[^>]*method="post"`, "i")
    );
  } finally {
    await new Promise(function (resolve, reject) {
      server.close(function (error) {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function testDeleteTaskRedirectsAndRemovesTaskFromList() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "todo-app-test-"));
  const repository = createTaskRepository({
    filePath: path.join(tempDir, "tasks.json")
  });
  const firstTask = await repository.create("Buy milk");
  const secondTask = await repository.create("Read book");
  const app = createApp({ taskRepository: repository });
  const server = app.listen(0);

  try {
    const address = server.address();
    const deleteResponse = await fetch(
      `http://127.0.0.1:${address.port}/tasks/${firstTask.id}/delete`,
      {
        method: "POST",
        redirect: "manual"
      }
    );

    assert.equal(deleteResponse.status, 302);
    assert.equal(deleteResponse.headers.get("location"), "/");

    const homeResponse = await fetch(`http://127.0.0.1:${address.port}/`);
    const html = await homeResponse.text();
    const tasks = await repository.getAll();

    assert.equal(homeResponse.status, 200);
    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].title, "Read book");
    assert.doesNotMatch(html, /Buy milk/);
    assert.match(html, /Read book/);
    assert.match(
      html,
      new RegExp(`<form[^>]*action="/tasks/${secondTask.id}/delete"[^>]*method="post"`, "i")
    );
  } finally {
    await new Promise(function (resolve, reject) {
      server.close(function (error) {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

module.exports = run;

if (require.main === module) {
  run()
    .then(function () {
      console.log("home route test passed");
    })
    .catch(function (error) {
      console.error(error);
      process.exitCode = 1;
    });
}

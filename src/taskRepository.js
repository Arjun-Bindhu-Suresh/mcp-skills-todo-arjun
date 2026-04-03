const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");

class TaskRepositoryError extends Error {
  constructor(message) {
    super(message);
    this.name = "TaskRepositoryError";
  }
}

function createTaskRepository(options) {
  const filePath = options.filePath;

  async function ensureFile() {
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    try {
      await fs.access(filePath);
    } catch (error) {
      if (error && error.code !== "ENOENT") {
        throw new TaskRepositoryError("Could not access task storage.");
      }

      await fs.writeFile(filePath, "[]", "utf8");
    }
  }

  async function readTasks() {
    await ensureFile();

    try {
      const fileContents = await fs.readFile(filePath, "utf8");
      const parsedTasks = JSON.parse(fileContents);

      if (!Array.isArray(parsedTasks)) {
        throw new TaskRepositoryError("Could not read tasks.");
      }

      return parsedTasks;
    } catch (error) {
      if (error instanceof TaskRepositoryError) {
        throw error;
      }

      throw new TaskRepositoryError("Could not read tasks.");
    }
  }

  async function writeTasks(tasks) {
    try {
      await fs.writeFile(filePath, JSON.stringify(tasks, null, 2), "utf8");
    } catch (error) {
      throw new TaskRepositoryError("Could not save tasks.");
    }
  }

  return {
    async getAll() {
      return readTasks();
    },

    async create(title) {
      const tasks = await readTasks();
      const nextTask = {
        id: crypto.randomUUID(),
        title: title,
        completed: false,
        createdAt: new Date().toISOString()
      };

      tasks.push(nextTask);
      await writeTasks(tasks);

      return nextTask;
    },

    async toggle(id) {
      const tasks = await readTasks();
      const task = tasks.find(function (entry) {
        return entry.id === id;
      });

      if (!task) {
        return false;
      }

      task.completed = !task.completed;
      await writeTasks(tasks);

      return true;
    },

    async remove(id) {
      const tasks = await readTasks();
      const filteredTasks = tasks.filter(function (entry) {
        return entry.id !== id;
      });

      if (filteredTasks.length === tasks.length) {
        return false;
      }

      await writeTasks(filteredTasks);
      return true;
    }
  };
}

createTaskRepository.TaskRepositoryError = TaskRepositoryError;

module.exports = createTaskRepository;

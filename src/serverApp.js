const express = require("express");
const path = require("path");

const createTaskRepository = require("./taskRepository");
const taskValidator = require("./taskValidator");

function createApp(options = {}) {
  const app = express();
  const taskRepository =
    options.taskRepository ||
    createTaskRepository({
      filePath: path.join(__dirname, "..", "data", "tasks.json")
    });

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "..", "views"));

  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.get("/", async function (req, res, next) {
    try {
      const tasks = await taskRepository.getAll();

      renderHomePage(res, {
        tasks: tasks,
        form: {
          title: "",
          error: null
        }
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/tasks", async function (req, res, next) {
    const validation = taskValidator.validateTaskTitle(req.body.title);

    if (!validation.isValid) {
      try {
        const tasks = await taskRepository.getAll();

        renderHomePage(res, {
          tasks: tasks,
          form: {
            title: typeof req.body.title === "string" ? req.body.title : "",
            error: validation.error
          }
        });
        return;
      } catch (error) {
        next(error);
        return;
      }
    }

    try {
      await taskRepository.create(validation.trimmedTitle);
      res.redirect("/");
    } catch (error) {
      next(error);
    }
  });

  app.post("/tasks/:id/toggle", async function (req, res, next) {
    try {
      await taskRepository.toggle(req.params.id);
      res.redirect("/");
    } catch (error) {
      next(error);
    }
  });

  app.post("/tasks/:id/delete", async function (req, res, next) {
    try {
      await taskRepository.remove(req.params.id);
      res.redirect("/");
    } catch (error) {
      next(error);
    }
  });

  return app;
}

function renderHomePage(res, viewModel) {
  res.render("index", {
    pageTitle: "Express To-Do App",
    tasks: viewModel.tasks,
    form: viewModel.form
  });
}

module.exports = createApp;

const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

let tasks = [];

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "src")));

app.get("/api/tasks", function (req, res) {
  res.json(tasks);
});

app.post("/api/tasks", function (req, res) {
  const text = typeof req.body.text === "string" ? req.body.text.trim() : "";

  if (!text) {
    return res.status(400).json({ error: "Task text is required." });
  }

  const newTask = {
    id: String(Date.now() + Math.random()),
    text: text
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.delete("/api/tasks/:id", function (req, res) {
  const originalLength = tasks.length;

  tasks = tasks.filter(function (task) {
    return task.id !== req.params.id;
  });

  if (tasks.length === originalLength) {
    return res.status(404).json({ error: "Task not found." });
  }

  res.status(204).send();
});

app.listen(PORT, function () {
  console.log("Server running at http://localhost:3000");
});
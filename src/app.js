document.addEventListener("DOMContentLoaded", function () {
  var taskForm = document.getElementById("task-form");
  var taskInput = document.getElementById("task-input");
  var taskList = document.getElementById("task-list");
  var message = document.getElementById("message");
  var tasks = [];

  function showMessage(text) {
    message.textContent = text;
  }

  async function loadTasks() {
    try {
      var response = await fetch("/api/tasks");
      tasks = await response.json();
      renderTasks();
    } catch (error) {
      showMessage("Could not load tasks.");
    }
  }

  function renderTasks() {
    taskList.innerHTML = "";

    if (tasks.length === 0) {
      var emptyMessage = document.createElement("li");
      emptyMessage.className = "empty-message";
      emptyMessage.textContent = "No tasks yet. Add one above.";
      taskList.appendChild(emptyMessage);
      return;
    }

    tasks.forEach(function (task) {
      var listItem = document.createElement("li");
      listItem.className = "task-item";

      var taskText = document.createElement("span");
      taskText.className = "task-text";
      taskText.textContent = task.text;

      var deleteButton = document.createElement("button");
      deleteButton.className = "delete-button";
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", async function () {
        try {
          await fetch("/api/tasks/" + task.id, {
            method: "DELETE"
          });
          await loadTasks();
        } catch (error) {
          showMessage("Could not delete task.");
        }
      });

      listItem.appendChild(taskText);
      listItem.appendChild(deleteButton);
      taskList.appendChild(listItem);
    });
  }

  taskForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    var text = taskInput.value.trim();

    if (!text) {
      showMessage("Please enter a task.");
      return;
    }

    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: text })
      });

      taskInput.value = "";
      taskInput.focus();
      showMessage("");
      await loadTasks();
    } catch (error) {
      showMessage("Could not add task.");
    }
  });

  loadTasks();
});

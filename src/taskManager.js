(function (globalScope) {
  function createTask(text) {
    return {
      id: String(Date.now() + Math.random()),
      text: text.trim(),
      completed: false
    };
  }

  function addTask(tasks, text) {
    var trimmedText = text.trim();

    if (!trimmedText) {
      return tasks;
    }

    return tasks.concat(createTask(trimmedText));
  }

  function toggleTask(tasks, id) {
    return tasks.map(function (task) {
      if (task.id !== id) {
        return task;
      }

      return {
        id: task.id,
        text: task.text,
        completed: !task.completed
      };
    });
  }

  function deleteTask(tasks, id) {
    return tasks.filter(function (task) {
      return task.id !== id;
    });
  }

  var taskManager = {
    createTask: createTask,
    addTask: addTask,
    toggleTask: toggleTask,
    deleteTask: deleteTask
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = taskManager;
  }

  globalScope.taskManager = taskManager;
})(typeof window !== "undefined" ? window : globalThis);

(function (globalScope) {
  var STORAGE_KEY = "todo-app-tasks";

  function loadTasks() {
    if (typeof localStorage === "undefined") {
      return [];
    }

    try {
      var savedTasks = localStorage.getItem(STORAGE_KEY);
      var parsedTasks = savedTasks ? JSON.parse(savedTasks) : [];

      return Array.isArray(parsedTasks) ? parsedTasks : [];
    } catch (error) {
      return [];
    }
  }

  function saveTasks(tasks) {
    if (typeof localStorage === "undefined") {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  var storageUtils = {
    loadTasks: loadTasks,
    saveTasks: saveTasks
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = storageUtils;
  }

  globalScope.storageUtils = storageUtils;
})(typeof window !== "undefined" ? window : globalThis);

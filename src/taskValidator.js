function validateTaskTitle(title) {
  const rawTitle = typeof title === "string" ? title : "";
  const trimmedTitle = rawTitle.trim();

  if (!trimmedTitle) {
    return {
      isValid: false,
      trimmedTitle: trimmedTitle,
      error: "Task title cannot be empty."
    };
  }

  if (trimmedTitle.length > 100) {
    return {
      isValid: false,
      trimmedTitle: trimmedTitle,
      error: "Task title cannot be longer than 100 characters."
    };
  }

  return {
    isValid: true,
    trimmedTitle: trimmedTitle,
    error: null
  };
}

module.exports = {
  validateTaskTitle: validateTaskTitle
};

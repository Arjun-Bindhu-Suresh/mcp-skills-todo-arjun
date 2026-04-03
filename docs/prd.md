

• PRD



&#x20; # Simple To-Do App



&#x20; ## Overview



&#x20; The Simple To-Do App is a small server-rendered web application built with Node.js, Express, and EJS. It is designed as a single-user personal task tracker and as a learning

&#x20; project for core web development concepts, including routing, form handling, validation, server-side rendering, persistence, and testing.



&#x20; Version 1 is intentionally narrow in scope. It supports listing tasks, creating tasks, toggling task completion, and deleting tasks. Data is persisted in a JSON file through a

&#x20; dedicated repository layer.



&#x20; ## Problem Statement



&#x20; The user wants a small but complete web application that is simple enough for learning and structured enough to demonstrate good backend design practices. A basic CRUD app

&#x20; without clear architectural boundaries tends to become messy quickly, especially when validation, persistence, and UI logic are mixed together.



&#x20; This project solves that by defining a constrained feature set and a clear module split:



&#x20; - Express routes/controllers for HTTP behavior

&#x20; - A validation module for task rules

&#x20; - A repository module as the main deep module over JSON persistence



&#x20; ## Goals



&#x20; - Build a functional single-user to-do app with a clean server-rendered workflow

&#x20; - Learn Express fundamentals through standard form submissions and redirects

&#x20; - Keep persistence simple with a JSON file while isolating storage concerns behind a repository

&#x20; - Centralize task title validation in a dedicated module

&#x20; - Establish a small but meaningful testing strategy

&#x20; - Prevent feature creep by explicitly defining out-of-scope items



&#x20; ## Target User



&#x20; The target user for version 1 is a single individual using the app for personal task tracking and learning purposes. This app is not intended for teams, multiple accounts, or

&#x20; production-grade concurrent usage.



&#x20; ## Core Features



&#x20; ### Task Management



&#x20; - View all tasks on the home page

&#x20; - Add a new task

&#x20; - Delete an existing task

&#x20; - Mark a task as complete

&#x20; - Mark a completed task as incomplete



&#x20; ### Task Model



&#x20; Each task includes:



&#x20; - id

&#x20; - title

&#x20; - completed

&#x20; - createdAt



&#x20; ### Home Page States



&#x20; - Normal state: show tasks in insertion order

&#x20; - Empty state: show a friendly message when no tasks exist

&#x20; - Validation error state: show an error message and preserve the previously entered value

&#x20; - Generic error state: show a simple generic error message



&#x20; ### Display Rules



&#x20; - Completed tasks are visually distinct using strikethrough or muted styling

&#x20; - Each task has separate controls for complete/uncomplete and delete

&#x20; - Active and completed tasks remain in a single list in insertion order

&#x20; - createdAt is stored but not displayed in version 1



&#x20; ## Technical Requirements



&#x20; ### Stack



&#x20; - Node.js

&#x20; - Express

&#x20; - EJS for server-rendered HTML

&#x20; - JSON file persistence



&#x20; ### Routing



&#x20; - GET / renders the main page with the task list and add-task form

&#x20; - POST /tasks creates a new task

&#x20; - POST /tasks/:id/toggle toggles completion status

&#x20; - POST /tasks/:id/delete deletes a task



&#x20; ### Architecture



&#x20; - Use standard HTML form submissions and redirects

&#x20; - Use one main EJS template for the home page

&#x20; - Add a small partial only if task row rendering becomes repetitive

&#x20; - Escape all user-provided content in templates



&#x20; ### Module Split



&#x20; - Routes/controllers:

&#x20;     - Handle requests, responses, redirects, rendering, and HTTP status codes

&#x20; - Validation module:

&#x20;     - Trim titles

&#x20;     - Reject empty or whitespace-only titles

&#x20;     - Reject titles longer than 100 characters

&#x20;     - Return structured validation errors

&#x20; - Repository:

&#x20;     - Encapsulate all file access

&#x20;     - Load and save the JSON task store

&#x20;     - Expose getAll(), create(title), toggle(id), and remove(id)



&#x20; ### Persistence



&#x20; - Use a JSON file as the only persistence mechanism in version 1

&#x20; - Automatically initialize the file if it does not exist

&#x20; - Keep tasks in insertion order

&#x20; - Use stable unique IDs instead of array indexes

&#x20; - Write the full task array back in one operation

&#x20; - Parse JSON defensively

&#x20; - Handle corrupt file state safely



&#x20; ## Validation and Error Handling



&#x20; ### Validation Rules



&#x20; - Trim whitespace before saving

&#x20; - Reject empty or whitespace-only titles

&#x20; - Limit titles to 100 characters



&#x20; ### Validation Failure Behavior



&#x20; - Re-render the main page

&#x20; - Show a clear validation error message

&#x20; - Preserve the previously entered value in the input field

&#x20; - Do not save the task



&#x20; ### Missing Task IDs



&#x20; For toggle or delete requests where the task ID does not exist:



&#x20; - Treat the action as a no-op

&#x20; - Do not crash

&#x20; - Redirect back to /

&#x20; - Log the event on the server



&#x20; ### Repository Failures



&#x20; For file read/write failures or corrupt JSON:



&#x20; - Return HTTP 500

&#x20; - Show a generic error message to the user

&#x20; - Log the detailed error on the server

&#x20; - Do not expose internal implementation details in the UI



&#x20; ## Testing Approach



&#x20; Testing for version 1 should be small but meaningful, focused on external behavior rather than implementation details.



&#x20; ### Repository Tests



&#x20; - Initializes missing file

&#x20; - Creates a task with:

&#x20;     - trimmed title

&#x20;     - unique ID

&#x20;     - completed: false

&#x20;     - createdAt

&#x20; - Preserves insertion order

&#x20; - Toggles an existing task

&#x20; - Removes an existing task

&#x20; - Returns false for missing IDs

&#x20; - Handles corrupt JSON safely



&#x20; ### Route-Level Tests



&#x20; - GET / shows the empty state when no tasks exist

&#x20; - Valid POST /tasks saves and redirects

&#x20; - Invalid POST /tasks shows a validation error and preserves input

&#x20; - Toggle and delete routes redirect properly

&#x20; - Repository failure returns 500 with a generic error message



&#x20; ### Testing Principles



&#x20; - Test user-visible behavior and module contracts

&#x20; - Do not test template engine internals

&#x20; - Treat the repository as the main deep module in the design



&#x20; ## Out-of-Scope Items



&#x20; The following are explicitly out of scope for version 1:



&#x20; - Authentication or user accounts

&#x20; - Multiple users

&#x20; - Editing tasks

&#x20; - Filtering or searching

&#x20; - Categories or tags

&#x20; - Due dates

&#x20; - Drag-and-drop or advanced UI interactions

&#x20; - Client-side JavaScript dependency

&#x20; - Database persistence

&#x20; - Sorting beyond insertion order



&#x20; ## Future Improvements



&#x20; Potential future enhancements after version 1:



&#x20; - Replace JSON persistence with SQLite or another database

&#x20; - Add task editing

&#x20; - Add filtering for all, active, and completed tasks

&#x20; - Add search

&#x20; - Add categories, tags, or due dates

&#x20; - Display createdAt in the UI

&#x20; - Improve write safety with a temp-file-and-rename pattern

&#x20; - Add richer UI feedback for missing task actions

&#x20; - Add authentication and multi-user support if the scope expands




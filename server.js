const createApp = require("./src/serverApp");
const PORT = 3000;

const app = createApp();

app.listen(PORT, function () {
  console.log("Server running at http://localhost:3000");
});

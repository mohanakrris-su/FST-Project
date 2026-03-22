require("dotenv").config();

const app = require("./app");
const { connectDB } = require("./config/db");

const port = process.env.PORT || 4001;

async function startServer() {
  await connectDB();
  app.listen(port, () => {
    console.log(`Admin AI backend running on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const adminAuth = require("./middleware/adminAuth");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173"
  })
);
app.use(helmet());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/admin/auth", authRoutes);
app.use("/api/admin/dashboard", adminAuth, dashboardRoutes);
app.use("/api/admin/predictions", adminAuth, predictionRoutes);
app.use("/api/admin/resources", adminAuth, resourceRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((error, req, res, next) => {
  const message = error.message || "Unexpected server error.";
  res.status(error.statusCode || 500).json({ message });
});

module.exports = app;

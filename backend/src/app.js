const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const errorHandler = require("./middlewares/errorHandler");
const autoMapRoutes = require("./routes/autoMapRoutes");

dotenv.config();
const app = express();

const fs = require("fs");
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/customers", customerRoutes);
app.use("/upload", uploadRoutes);
app.use("/", autoMapRoutes);
app.use(errorHandler);

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Backend is running" });
});

module.exports = app;

/*
const requiredEnv = ["PORT", "MONGO_URI", "JWT_SECRET"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`);
    process.exit(1);
  }
}
  */
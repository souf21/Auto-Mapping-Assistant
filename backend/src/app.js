const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

const fs = require("fs");
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.use((req, res, next) => { next(); });

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/customers", customerRoutes);
app.use("/upload", uploadRoutes);

app.use(errorHandler);

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Backend is running" });
});

module.exports = app;

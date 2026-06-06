require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const routes = require("./routes");
const { errorHandler, notFound } = require("./middleware/error.middleware");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files publicly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.json({ message: "Raymond backend server is  running successfully." });
});

app.use("/api/v1", routes);

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Raymond backend is running.",
    timestamp: new Date().toISOString(),
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;

// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

const express = require("express");
const cors = require("cors");

const app = express();

const allowedOrigins = [
  'https://pawkeeper.netlify.app',
  'https://pawkeeper-lhk-be-production.up.railway.app',
  'http://localhost:5173',
  'http://localhost:5005'
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400,
  })
);

require("./config")(app);

app.get('/debug-env', (req, res) => {
  res.json({
    origin: process.env.ORIGIN,
    port: process.env.PORT
  });
});

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
app.use("/api", indexRoutes);

const userRoutes = require("./routes/user.routes");
app.use("/users", userRoutes);

const reviewRoutes = require("./routes/review.routes");
app.use("/reviews", reviewRoutes);

app.use((err, req, res, next) => {
  if (err.name === 'CORSError') {
    res.status(403).json({ 
      message: 'CORS error', 
      error: err.message 
    });
  } else {
    next(err);
  }
});

require("./error-handling")(app);

module.exports = { app, allowedOrigins };
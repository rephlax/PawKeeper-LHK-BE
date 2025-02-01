require("dotenv").config();
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


app.options('*', cors());

app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', allowedOrigins);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

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
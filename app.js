require("dotenv").config();
require("./db");

const express = require("express");
const cors = require("cors");
const app = express();

// const allowedOrigins = [
//   'https://pawkeeper.netlify.app',
//   'https://pawkeeper-lhk-be.onrender.com',
//   'http://localhost:5173',
//   'http://localhost:5005'
// ];


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://pawkeeper.netlify.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});


app.use(
  cors({
    origin:   'https://pawkeeper.netlify.app',
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
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

const messageRoutes = require("./routes/message.routes");
app.use("/messages", messageRoutes);

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

module.exports = { app };
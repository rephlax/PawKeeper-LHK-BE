const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");

// Middleware configuration
module.exports = (app) => {
  // Trust proxy setting for hosted environments
  app.set("trust proxy", 1);

  // Development logging
  app.use(logger("dev"));

  // Request parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });
};
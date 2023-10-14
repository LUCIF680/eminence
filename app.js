const express = require("express");
const path = require("path");
const cors = require("cors");
var createError = require("http-errors");
const helmet = require("helmet");
require("dotenv").config();

const passport = require("./middleware/passport");
const locals = require("./utils/locals.json");
const { logger } = require("./utils/logger");
const version = "/v1";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());

app.use(`${version}/users`, require("./routes/auth"));
app.use(`${version}/product`, require("./routes/products"));

app.use((req, res, next) => {
  next(createError(404));
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (!err.status) err.status = 500;
  logger.error(err);
  if (err.code === 11000) {
    res.status(400).json({ error: locals.error_user_already_exists });
  }
  res.status(err.status).json({ error: err.message });
});
module.exports = app;

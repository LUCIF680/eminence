const router = require("express").Router();
const createError = require("http-errors");
const { joiPasswordExtendCore } = require("joi-password");
const passport = require("passport");
const errorHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const joi = require("joi");
require("dotenv").config();

const validate = require("../middleware/validate-req");
const locals = require("../utils/locals.json");
const { User } = require("../models");
const { createAccountLimiter, loginLimit } = require("../middleware/limiter");
const client = require("../utils/redis-client");

const joiPassword = joi.extend(joiPasswordExtendCore);
const schema = {};
schema.authenticate = joi.object({
  username: joi.string().alphanum().trim().required(),
  password: joiPassword
    .string()
    .minOfSpecialCharacters(1)
    .minOfNumeric(2)
    .noWhiteSpaces()
    .onlyLatinCharacters()
    .required(),
});

router.post(
  "/register",
  validate.joi(schema.authenticate),
  createAccountLimiter,
  errorHandler(async (req, res) => {
    let { username, password } = req.body;

    password = await bcrypt.hash(password, 10);
    const user = new User({ username, password });
    await user.save();

    const accessToken = jwt.sign({ sub: user }, process.env.AUTH_KEY, {
      expiresIn: 84000,
    });
    return res.status(201).json({ access_token: accessToken });
  })
);

router.post(
  "/login",
  loginLimit,
  validate.joi(schema.authenticate),
  errorHandler((req, res, next) => {
    // eslint-disable-next-line no-unused-vars
    passport.authenticate("local", { session: false }, (err, user, _info) => {
      if (err || !user) {
        next(createError(400, locals.error_invalid_credentials));
      }

      req.login(user, { session: false }, (err) => {
        if (err) {
          return res.send(err);
        }
        const accessToken = jwt.sign({ sub: user }, process.env.AUTH_KEY, {
          expiresIn: 84000,
        });
        return res.json({ access_token: accessToken });
      });
    })(req, res, next);
  })
);

router.get("/", (req, res, next) => {
  // eslint-disable-next-line no-unused-vars
  passport.authenticate("jwt", { session: false }, (err, user, _info) => {
    return res.json({ username: user.username, id: user._id });
  })(req, res, next);
});

router.put(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const token = req.header("Authorization").split(" ")[1];
    client.setex(`blacklist_${token}`, 84000, true);
    return res.status(201).send({ message: "Logout successful" });
  }
);

module.exports = router;

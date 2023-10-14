const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
require("dotenv").config();

const { User } = require("../models");
const locals = require("../utils/locals.json");

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.AUTH_KEY,
};

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true,
    },
    async function (req, username, plainPassword, done) {
      const user = await User.findOne({ username }).lean();
      if (!user) {
        done(null, false);
      }
      if (!(await bcrypt.compare(plainPassword, user.password))) {
        return done(null, false, { message: locals.error_invalid_credentials });
      }

      return done(null, { username: user.username });
    }
  )
);

const jwtAuth = new JwtStrategy(jwtOptions, async (payload, done) => {
  const user = await User.findOne({ username: payload.sub.username });
  if (user) {
    done(null, user);
  } else {
    done(null, false);
  }
});

passport.use("jwt", jwtAuth);

module.exports = passport;

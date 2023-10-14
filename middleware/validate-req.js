const map = require("lodash/map");
const merge = require("lodash/merge");
const client = require("../utils/redis-client");

module.exports.joi = (schema, source = "body") => {
  return async (req, res, next) => {
    try {
      req[source] = await schema.validateAsync(req[source], {
        abortEarly: false,
      });
    } catch (error) {
      const transformed = map(error.details, (item) => {
        const key = item.path[0];
        const value = item.message;
        return { [key]: value };
      });

      const response = merge(...transformed);
      return res.status(400).json(response);
    }

    return next();
  };
};

module.exports.isLogout = async (req, res, next) => {
  const token = req.header("Authorization").split(" ")[1];
  const isBlacklistToken = Boolean(await client.get(`blacklist_${token}`));
  if (isBlacklistToken === true) {
    return res.sendStatus(401);
  }
  next();
};

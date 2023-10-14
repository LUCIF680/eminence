const router = require("express").Router();
const passport = require("passport");
const errorHandler = require("express-async-handler");
const axios = require("axios");
const groupBy = require("lodash/groupBy");
const find = require("lodash/find");
const joi = require("joi");
require("dotenv").config();

const validate = require("../middleware/validate-req");

const schema = {};
schema.group = joi.object({
  group: joi.string().trim().valid("category", "brand").required(),
});

schema.id = joi.object({
  id: joi.number().positive().required(),
});

router.get(
  "/group/:group",
  validate.joi(schema.group, "params"),
  validate.isLogout,
  passport.authenticate("jwt", { session: false }),
  errorHandler(async (req, res) => {
    // Should implement cache here to save the response and use it later
    const response = await axios.get("https://dummyjson.com/products");
    const { products } = response.data;
    let groups = groupBy(products, req.params.group);
    return res.json(groups);
  })
);

router.get(
  "/:id",
  validate.joi(schema.id, "params"),
  validate.isLogout,
  passport.authenticate("jwt", { session: false }),
  errorHandler(async (req, res) => {
    // for example here we should use redis cache data for dummyjson
    const response = await axios.get("https://dummyjson.com/products");
    const { products } = response.data;
    let product = find(products, (o) => o.id === req.params.id);
    return res.json(product);
  })
);
module.exports = router;

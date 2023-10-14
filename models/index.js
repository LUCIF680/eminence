const mongoose = require("mongoose");

const Schema = mongoose.Schema;

module.exports.User = mongoose.model(
  "user",
  new Schema(
    {
      username: { type: String, required: true, unique: true },
      password: { type: String, required: true },
    },
    { strict: true }
  )
);

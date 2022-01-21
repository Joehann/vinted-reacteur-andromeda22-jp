const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: {
    type: String,
    unique: true,
  },
  account: {
    username: {
      required: true,
      type: String,
    },
    phone: String,
    avatar: Object,
  },
  token: String,
  hash: String,
  salt: String,
});

module.exports = User;

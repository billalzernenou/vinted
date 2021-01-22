const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: {
    unique: true,
    type: String,
  },
  account: {
    username: {
      required: true,
      type: String,
    },
    phone: String,
    avatar: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    }, // nous verrons plus tard comment uploader une image
  },
  token: String,
  hash: String,
  salt: String,
});

//export model User
module.exports = User;

// import model user
const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    // grab token authorization headers
    if (token) {
      const token = req.headers.authorization.replace("Bearer ", "");
      //check existence user in BDD
      const user = await User.findOne({ token: token }).select(
        "account email token"
      );
      if (user) {
        // add key user to req.user
        req.user = user;
        return next();
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = isAuthenticated;

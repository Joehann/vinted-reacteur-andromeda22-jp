const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  if (!req.headers.authorization) {
    res.status(401).json("Unauthorized");
    return;
  }

  const reqToken = req.headers.authorization.replace("Bearer ", "");
  const user = await User.findOne({ token: reqToken });

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  req.user = user;
  next();
};

module.exports = isAuthenticated;

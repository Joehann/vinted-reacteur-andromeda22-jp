const uid2 = require("uid2");

const generateToken = () => {
  const token = uid2(64);
  return token;
};

module.exports = generateToken;

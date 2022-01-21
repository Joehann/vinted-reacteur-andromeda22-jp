const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const hashPassword = (password, salt) => {
  if (!salt) {
    salt = uid2(64);
  }
  const hash = SHA256(password + salt).toString(encBase64);
  const datas = [hash, salt];
  return datas;
};

module.exports = hashPassword;

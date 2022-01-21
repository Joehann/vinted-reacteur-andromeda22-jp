const express = require("express");
const User = require("../models/User");
const router = express.Router();
const generateToken = require("../utils/generateToken");
const hashPassword = require("../utils/hashPassword");
const cloudinary = require("cloudinary").v2;

/*
Route : /user/signup || POST
Permet de s'enregistrer sur l'application
Gestion des erreurs : 
    - email déjà existant
    - username n'est pas renseigné
*/
router.post("/user/signup", async (req, res) => {
  try {
    const emailIsExisting = await User.findOne({ email: req.fields.email });
    if (!emailIsExisting) {
      if (req.fields.username) {
        const hashed = hashPassword(req.fields.password);
        const hashedPassword = hashed[0];
        const salt = hashed[1];
        const token = generateToken();

        let pictureToUpload = req.files.picture.path;
        const uploadResult = await cloudinary.uploader.upload(pictureToUpload, {
          folder: "vinted/users",
        });

        const newUser = await new User({
          email: req.fields.email,
          account: {
            username: req.fields.username,
            phone: req.fields.phone,
            avatar: uploadResult,
          },
          hash: hashedPassword,
          salt: salt,
          token: token,
        });
        newUser.save();
        res.status(200).json(newUser);
      } else {
        res.status(400).json({
          message: "Oops ! Le champs username doit être renseigné...",
        });
      }
    } else {
      res.status(400).json({ message: "Cet email est déjà utilisé !" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/*
Route : /user/login || POST
Permet de se connecter à l'application
Gestion des erreurs:
    - L'email et/ou le mot de passe ne sont pas valides
*/
router.post("/user/login", async (req, res) => {
  try {
    let user = await User.findOne({ email: req.fields.email });
    const loginPassword = hashPassword(req.fields.password, user.salt);
    if (user && loginPassword[0] === user.hash) {
      user = await user.select("email account");
      res.status(200).json({ message: "Authentification réussie", user: user });
    } else {
      res.status(400).json({
        message: "L'email et/ou le mot de passe ne sont pas valides !",
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

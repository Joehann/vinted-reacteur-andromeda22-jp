require("dotenv").config();
const express = require("express");
const cors = require("cors");
const formidable = require("express-formidable");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(formidable());

mongoose.connect(process.env.MONGODB_URI);

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const userRoutes = require("./routes/users");
app.use(userRoutes);
const offerRoutes = require("./routes/offers");
app.use(offerRoutes);

app.get("/", (req, res) => {
  try {
    res.json("Hello World ! :/");
  } catch (error) {
    res.status(400).json(error.message);
  }
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "Cette route n'existe pas !" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});

//Utilisation du back du Reacteur. Code non testé pour le moment.

const express = require("express");
const router = express.Router();
const stripe = require("stripe");
const formidable = require("express-formidable");
router.use(formidable());

const stripe = stripe(process.env.STRIPE_SECRET);

router.post("/payment", async (req, res) => {
  try {
    const response = await stripe.charges.create({
      amount: (req.fields.amount * 100).toFixed(0),
      currency: "eur",
      description: `Objet acheté : ${req.fields.title}`,
      source: req.fields.token, //Token transmis par Stripe
    });

    res.json(response.status);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

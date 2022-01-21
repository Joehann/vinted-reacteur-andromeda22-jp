const Offer = require("../models/Offer");

const isOwner = async (req, res, next) => {
  console.log(req.fields.offer_id);
  const offer = await Offer.findById(req.fields.offer_id).populate("owner");
  console.log(offer);
  if (req.user.id !== offer.owner.id) {
    res.status(401).json("Unauthorized");
    return;
  }
  req.offer = offer;
  next();
};

module.exports = isOwner;

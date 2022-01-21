const mongoose = require("mongoose");

const Offer = mongoose.model("Offer", {
  product_name: { type: String, required: true },
  product_description: { type: String, required: true },
  product_price: { type: Number, required: true },
  product_details: { type: Array },
  product_image: { type: mongoose.Schema.Types.Mixed, default: {} },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  post_at: { type: String, default: Date.now() },
});

module.exports = Offer;

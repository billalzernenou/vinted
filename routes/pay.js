const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post("/pay", async (req, res) => {
  try {
    //tomporary : mister don't try client says grab Id and find the product price your self ..
    const price = 120 + 100 * Number(req.fields.price);
    const stripeToken = req.fields.stripeToken;
    const response = await stripe.charges.create({
      amount: price,
      currency: "eur",
      description: req.fields.title,
      source: stripeToken,
    });
    console.log(response);
    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

module.exports = router;

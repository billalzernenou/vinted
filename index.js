const express = require("express");
const mongoose = require("mongoose");
const formidable = require("express-formidable");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(formidable());
app.use(cors);

// BDD connect
mongoose.connect(process.env.MONGODB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
});

// config cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_PUBLIC_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

// import routes
const routeUser = require("./routes/user");
const routerOffer = require("./routes/offer");
app.use(routeUser);
app.use(routerOffer);

app.all("*", (req, res) => {
  res.status(404).json({ message: "page not found" });
});
app.listen(process.env.PORT, () => {
  console.log("Server Started ");
});

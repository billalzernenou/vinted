const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const cloudinary = require("cloudinary").v2;

//import model user
const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  try {
    // email unique assert
    const user = await User.findOne({ email: req.fields.email });
    if (!user) {
      if (req.fields.username && req.fields.email && req.fields.password) {
        //step 1 : encrypt passWord
        const salt = uid2(64);
        const hash = SHA256(req.fields.password + salt).toString(encBase64);
        const token = uid2(64);
        //step 2.1 : new user initialisation
        const newUser = new User({
          email: req.fields.email,
          account: {
            username: req.fields.username,
            phone: req.fields.phone,
          },
          token: token,
          hash: hash,
          salt: salt,
        });
        // step 2.2 upload profile picture
        if (req.files.picture.path) {
          const pictureToUpload = req.files.picture.path;
          const result = await cloudinary.uploader.upload(pictureToUpload, {
            folder: "vinted/users",
            public_id: newUser.id,
          });
          newUser.account.avatar = result.secure_url;
        }

        // step 3 : Save user
        await newUser.save();
        //step 4 : response to the client
        res.status(200).json({
          _id: newUser._id,
          token: newUser.token,
          account: {
            username: newUser.account.username,
            phone: newUser.account.phone,
          },
          avatar: newUser.account.avatar,
        });
      } else {
        res.status(400).json({
          message: "Missing parameters",
        });
      }
    } else {
      res.status(400).json({
        message: "This email already has an account",
      });
    }
  } catch (error) {
    res.status(400).json({ message: error });
  }
});
router.post("/user/login", async (req, res) => {
  try {
    {
      //find in BDD the user who want's to login
      const user = await User.findOne({ email: req.fields.email });

      if (user) {
        // generate a new hash with entred password + salt user from BDD
        const password = req.fields.password;
        hash = user.hash;
        salt = user.salt;
        generateHash = SHA256(password + salt).toString(encBase64);
        // hash ok => hash from DataBase === generated hash
        if (generateHash === hash) {
          //response ok
          res.status(200).json({
            _id: user._id,
            token: user.token,
            account: {
              username: user.account.username,
              phone: user.account.phone,
            },
          });
        } else {
          res.status(401).json({
            message: "Unauthorized",
          });
        }
      } else {
        res.status(401).json({
          message: "Unauthorized",
        });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error });
  }
});
module.exports = router;

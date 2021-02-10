const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

// import models
const Offer = require("../models/Offer");
const User = require("../models/User");

//import function
const isAuthenticated = require("../middleware/isAuthenticated");

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    if (
      req.fields.product_description.length <= 500 &&
      req.fields.product_name.length <= 50 &&
      Number(req.fields.product_price) <= 100000
    ) {
      // intialise offer

      const createdOffer = new Offer({
        product_name: req.fields.product_name,
        product_description: req.fields.product_description,
        product_price: req.fields.product_price,

        product_details: [
          {
            brand: req.fields.brand,
          },
          {
            size: req.fields.size,
          },
          {
            condition: req.fields.condition,
          },
          {
            color: req.fields.color,
          },
          {
            location: req.fields.location,
          },
        ],
        //   product_image: result.secure_url,
        owner: req.user,
      });
      //  Grab the path of the picture using req.files  thanks express formidable !
      if (req.files.picture.path) {
        const pictureToUpload = req.files.picture.path;
        // use cloudinary service to load the image  & set public_id === offer.id
        const result = await cloudinary.uploader.upload(pictureToUpload, {
          folder: `/vinted/offers/${createdOffer.id}`,
          // public_id: createdOffer.id,
        });
        createdOffer.product_image = result;
      }

      //save offer
      await createdOffer.save();
      //response to client
      res.status(200).json(createdOffer);
    } else {
      res.status(401).json({ message: "your fields are Not valid " });
    }
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

router.post("/offer/update", isAuthenticated, async (req, res) => {
  try {
    if (req.fields.id) {
      if (
        req.fields.product_name ||
        req.fields.product_price ||
        req.fields.product_description ||
        req.files.picture.path
      ) {
        const offerToUpdate = await Offer.findOne({
          id: req.fields.id,
        });
        if (offerToUpdate) {
          if (req.fields.product_name) {
            offerToUpdate.product_name = req.fields.product_name;
          }
          if (req.fields.product_price) {
            offerToUpdate.product_price = req.fields.product_price;
          }
          if (req.fields.product_description) {
            offerToUpdate.product_description = req.fields.product_description;
          }
          if (req.fields.product_details) {
            offerToUpdate.product_details = req.fields.product_details;
          }
          if (req.files.picture.path) {
            // prepareold picture  to delete
            // const pictureToDestroy = offerToUpdate.product_image;
            // use cloudinary service to load the image
            const pictureToUpload = req.files.picture.path;
            const result = await cloudinary.uploader.upload(pictureToUpload, {
              folder: `/vinted/offers/${createdOffer.id}`,
              // public_id: offerToUpdate.id,
            });
            offerToUpdate.product_image = result;
            //destroy old image
            // await cloudinary.uploader.destroy(pictureToDestroy); no need
          }
          // saving offert after update
          await offerToUpdate.save;
          //response to client
          res.status(200).json(offerToUpdate);
        } else {
          res.status(400).json({ message: "Offer not found" });
        }
      } else {
        res.status(400).json({ message: "send at least one modification" });
      }
    } else {
      res.status(400).json({ message: "please set an Id " });
    }
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

router.post("/offer/delete", isAuthenticated, async (req, res) => {
  try {
    const offerToDelete = await Offer.findById(req.fields.id);

    if (offerToDelete) {
      // use cloudinary to delete picture
      if (offerToDelete.product_image) {
        const pictureToDestroy = offerToDelete.product_image;
        await cloudinary.uploader.destroy(pictureToDestroy);
      }
      //delete offer
      await offerToDelete.delete();
      res.status(200).json("offer deleted");
    } else {
      res.status(404).json({ message: "Offer doesn't exist" });
    }
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

router.get("/offers", async (req, res) => {
  try {
    // page to displat and maxDisplay
    const maxDisplayOffers = 3;
    let pageToDisplay;
    if (req.query.page < 1) {
      pageToDisplay = 1;
    } else {
      pageToDisplay = Number(req.query.page);
    }
    // set filter
    filters = {};
    // sort filters
    let sortProductPrice = {};
    // query title
    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }
    // query priceMin priceMax
    if (req.query.priceMin) {
      filters.product_price = {
        $gte: Number(req.query.priceMin),
      };
    }
    if (req.query.priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = Number(req.query.priceMax);
      } else {
        filters.product_price = {
          $lte: Number(req.query.priceMax),
        };
      }
    }
    if (req.query.sort) {
      sortProductPrice = req.query.sort.replace("price-", "");
    } else {
      sortProductPrice = null;
    }
    // find
    const offers = await Offer.find(filters)
      .sort({ product_price: sortProductPrice })
      .skip((pageToDisplay - 1) * maxDisplayOffers)
      .limit(maxDisplayOffers)
      .select("product_name product_price product_description");

    if (offers.length > 0) {
      //count documents using parameter filters
      const offersCount = await Offer.countDocuments(filters);
      //response to client
      res.status(200).json({ count: offersCount, offers: offers });
    } else {
      res.status(200).json({ message: "No offer found" });
    }
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

router.post("/offer/:id", async (req, res) => {
  try {
    console.log("a");
    // find offer
    if (req.params.id) {
      const offer = await Offer.findById(req.params.id);
      if (offer) {
        res.status(200).json(offer);
      } else {
        res.status(400).json({ message: "the offer doesn't exist" });
      }
    } else {
      res.status(400).json({ message: "Id missing" });
    }
  } catch (error) {
    res.status(400).json({ message: error });
  }
});
module.exports = router;

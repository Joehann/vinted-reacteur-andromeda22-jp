const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

//Models required
const Offer = require("../models/Offer");
const User = require("../models/User");

//Middlewares required
const isAuthenticated = require("../middlewares/isAuthenticatedMiddleware");
const isOwner = require("../middlewares/isOwnerMiddleware");

////////////
// ROUTES //
////////////
/*
Route : /offer/publish | POST
En tant qu'utilisateur inscrit sur Vinted, je souhaite créer une offre et uploader une image liée sur Cloudinary (dossier: /vinted)
Tests :
    - description limitée à 500 caractères
    - title limité à 50 caractères
    - price limité à 100000
*/
router.post("/offer/publish", isAuthenticated, async (req, res) => {
  //   console.log(req.files);

  if (req.fields.title.length > 50) {
    res.status(400).json("Le titre ne doit pas dépasser 50 caractères");
    return;
  }
  if (req.fields.description.length > 500) {
    res.status(400).json("La description ne doit pas dépasser 500 caractères");
    return;
  }
  if (req.fields.price > 100000) {
    res.status(400).json("Le prix ne doit pas excéder 100000");
    return;
  }

  try {
    const offer = new Offer({
      product_name: req.fields.title,
      product_description: req.fields.description,
      product_price: req.fields.price,
      product_details: [
        { MARQUE: req.fields.brand },
        { TAILLE: req.fields.size },
        { ÉTAT: req.fields.condition },
        { COULEUR: req.fields.color },
        { EMPLACEMENT: req.fields.city },
      ],
      // product_image: uploadResult,
      owner: req.user,
    });
    if (req.files.picture) {
      let pictureToUpload = req.files.picture.path;
      const uploadResult = await cloudinary.uploader.upload(pictureToUpload, {
        folder: `vinted/offers/${offer.id}`,
      });
      offer.product_image = uploadResult;
    }

    await offer.save();
    res.json({ message: "Votre article est publié !", offer: offer });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/*
Route: /offer/update | PUT
En tant que créateur de l'annonce, je souhaite la modifier
*/
router.put("/offer/update", isAuthenticated, isOwner, async (req, res) => {
  try {
    // console.log(req.offer);
    req.offer.product_name = req.fields.title;
    req.offer.product_description = req.fields.description;
    req.offer.product_price = req.fields.price;
    (req.offer.product_details = [
      {
        MARQUE: req.fields.brand,
      },
      {
        TAILLE: req.fields.size,
      },
      {
        ÉTAT: req.fields.condition,
      },
      {
        COULEUR: req.fields.color,
      },
      {
        EMPLACEMENT: req.fields.city,
      },
    ]),
      req.offer.save();
    res.status(200).json("L'offre a été mise à jour.");
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/*
Route: /offer/delete | DELETE
En tant que créateur de l'annonce, je souhaite la supprimer.
Le dossier contenant la photo est supprimé sur Cloudinary.
*/
router.delete("/offer/delete", isAuthenticated, isOwner, async (req, res) => {
  try {
    console.log(req.offer.id);
    await cloudinary.api.delete_resources_by_prefix(
      `vinted/offers/${req.offer.id}`
    );
    await cloudinary.api.delete_folder(`vinted/offers/${req.offer.id}`);
    // await req.offer.delete();
    res.status(200).json("L'annonce a été supprimée");
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/*
Route : /offers | GET
Récupérer les offres avec des filtres optionnels
Les filtres sont passés en query (title, priceMin, priceMax, price-desc, price-asc, page)
On souhaite afficher 3 résultats par page
*/
router.get("/offers", async (req, res) => {
  try {
    const filtersObject = {};
    if (req.query.title) {
      filtersObject.product_name = new RegExp(req.query.title, "i");
    }

    if (req.query.priceMin || req.query.priceMax) {
      filtersObject.product_price = {};
      if (req.query.priceMin) {
        filtersObject.product_price.$gte = Number(req.query.priceMin);
      }
      if (req.query.priceMax) {
        filtersObject.product_price.$lte = Number(req.query.priceMax);
      }
    }

    let sort = "asc";
    if (req.query.sort) {
      sort = req.query.sort.replace("price-", "");
    }

    let page = 1;
    if (req.query.page && req.query.page > 0) {
      page = Number(req.query.page);
    }
    const limit = 3;

    const offers = await Offer.find(filtersObject)
      // .select("product_name product_price")
      .sort({ product_price: sort })
      .limit(limit)
      .skip((page - 1) * limit);

    const count = await Offer.countDocuments(filtersObject);

    const result = {
      count: count,
      offers: offers,
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(401).json(error.message);
  }
});

/*
Route : /offer/:id | GET
En tant qu'utilisateur, je souhaite rechercher une annonce en fonction de son id
Je dois récupérer les informations de la personne qui a posté l'annonce
*/
router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "-hash -salt -token",
    });
    res.status(200).json(offer);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;

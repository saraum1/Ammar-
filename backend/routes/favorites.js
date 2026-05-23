const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");
const { toggleFavorite, getFavorites, getFavoriteIds } = require("../controllers/favoriteController");
router.use(auth);
router.get("/",      getFavorites);
router.get("/ids",   getFavoriteIds);
router.post("/toggle", toggleFavorite);
module.exports = router;
const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");
const { uploadPortfolioImage } = require("../middleware/upload");
const {
  getCompanyPortfolio,
  getMyPortfolio,
  addPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem
} = require("../controllers/portfolioController");
router.get("/company/:id", getCompanyPortfolio);
router.get("/mine",    auth, getMyPortfolio);
router.post("/", auth, (req, res, next) => {
  uploadPortfolioImage.single("image")(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || "خطأ في رفع الصورة" });
    next();
  });
}, addPortfolioItem);
router.patch("/:id", auth, (req, res, next) => {
  uploadPortfolioImage.single("image")(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || "خطأ في رفع الصورة" });
    next();
  });
}, updatePortfolioItem);
router.delete("/:id", auth, deletePortfolioItem);
module.exports = router;
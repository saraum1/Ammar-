const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");
const {
  getCompanyProducts,
  getMyProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  searchProducts
} = require("../controllers/productController");

router.get("/mine",   auth, getMyProducts);
router.get("/search", searchProducts);
router.get("/company/:companyId", getCompanyProducts);
router.post("/",     auth, addProduct);
router.patch("/:id", auth, updateProduct);
router.delete("/:id", auth, deleteProduct);

module.exports = router;

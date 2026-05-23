const express      = require("express");
const router       = express.Router();
const auth         = require("../middleware/auth");
const { uploadImage } = require("../middleware/upload");

const {
  getCompanies,
  getCompany,
  getMyProfile,
  updateMyProfile,
  uploadCover,
} = require("../controllers/companyController");

router.get("/",    getCompanies);

router.get("/me/profile",   auth, getMyProfile);
router.patch("/me/profile", auth, updateMyProfile);
router.post("/me/cover",    auth, uploadImage.single("cover"), uploadCover);

router.get("/:id", getCompany);

module.exports = router;

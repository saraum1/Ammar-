const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");
const { createReview, getCompanyReviews } = require("../controllers/reviewController");
router.post("/", auth, createReview);
router.get("/company/:companyId", getCompanyReviews);
module.exports = router;
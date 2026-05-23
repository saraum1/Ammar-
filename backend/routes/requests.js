const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");
const {
  createRequest,
  getClientRequests,
  getCompanyRequests,
  updateRequestStatus
} = require("../controllers/requestController");
router.use(auth);
router.post("/",                        createRequest);
router.get("/my-requests",              getClientRequests);
router.get("/company-requests",         getCompanyRequests);
router.patch("/:id/status",             updateRequestStatus);
module.exports = router;
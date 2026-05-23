const express    = require("express");
const router     = express.Router();
const adminAuth  = require("../middleware/adminAuth");
const {
  getPendingCompanies,
  getAllCompanies,
  approveCompany,
  rejectCompany,
  createAdmin
} = require("../controllers/adminController");
router.post("/create-admin", createAdmin);
router.use(adminAuth);
router.get("/companies/pending", getPendingCompanies);
router.get("/companies/all",     getAllCompanies);
router.patch("/companies/:id/approve", approveCompany);
router.patch("/companies/:id/reject",  rejectCompany);
module.exports = router;
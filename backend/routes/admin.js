const express    = require("express");
const router     = express.Router();
const adminAuth  = require("../middleware/adminAuth");
const {
  getPendingCompanies,
  getAllCompanies,
  approveCompany,
  rejectCompany,
  createAdmin,
  getDeleteRequests,
  deleteCompany,
  rejectDeleteRequest,
} = require("../controllers/adminController");
router.post("/create-admin", createAdmin);
router.use(adminAuth);
router.get("/companies/pending",           getPendingCompanies);
router.get("/companies/all",               getAllCompanies);
router.get("/companies/delete-requests",   getDeleteRequests);
router.patch("/companies/:id/approve",     approveCompany);
router.patch("/companies/:id/reject",      rejectCompany);
router.delete("/companies/:id",            deleteCompany);
router.patch("/companies/:id/reject-delete", rejectDeleteRequest);
module.exports = router;
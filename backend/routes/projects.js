const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");
const { uploadNoteImage } = require("../middleware/upload");
const {
  getClientProjects,
  getClientProject,
  addClientNote,
  getCompanyProjects,
  getCompanyProject,
  updatePhase,
  addUpdate,
  updateProjectStatus,
  updateCalculator,
  markRead
} = require("../controllers/projectController");
router.use(auth);
router.get("/client",     getClientProjects);
router.get("/client/:id", getClientProject);
router.post("/client/:id/note", (req, res, next) => {
  uploadNoteImage.single("noteImage")(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || "خطأ في رفع الصورة" });
    next();
  });
}, addClientNote);
router.patch("/client/:id/calculator", updateCalculator);
router.get("/company",              getCompanyProjects);
router.get("/company/:id",          getCompanyProject);
router.patch("/company/:id/phase",  updatePhase);
router.post("/company/:id/update",  addUpdate);
router.patch("/company/:id/status", updateProjectStatus);
router.post("/:id/mark-read", markRead);
module.exports = router;
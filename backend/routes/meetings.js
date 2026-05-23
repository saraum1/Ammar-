const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");
const {
  proposeMeeting,
  companyProposeMeeting,
  getClientMeetings,
  getCompanyMeetings,
  updateMeetingStatus
} = require("../controllers/meetingController");
router.use(auth);
router.post("/",                proposeMeeting);
router.post("/company-propose", companyProposeMeeting);
router.get("/client",           getClientMeetings);
router.get("/company",          getCompanyMeetings);
router.patch("/:id",            updateMeetingStatus);
module.exports = router;
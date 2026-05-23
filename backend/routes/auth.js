const express        = require("express");
const router         = express.Router();
const authMiddleware = require("../middleware/auth");
const { uploadPDF }  = require("../middleware/upload");
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  uploadRegistrationDoc,
  uploadDocByCredentials,
  updateProfile,
  googleAuth,
} = require("../controllers/authController");
router.post("/register",          register);
router.post("/login",             login);
router.post("/logout",            logout);
router.post("/google",            googleAuth);
router.post("/forgot-password",   forgotPassword);
router.post("/reset-password",    resetPassword);
router.post("/change-password",   authMiddleware, changePassword);
router.patch("/profile",          authMiddleware, updateProfile);
router.post("/upload-cr-doc",     authMiddleware, uploadPDF.single("crDoc"), uploadRegistrationDoc);
router.post("/upload-cr-doc-open", uploadPDF.single("crDoc"), uploadDocByCredentials);
module.exports = router;
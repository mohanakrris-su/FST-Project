const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const asyncHandler = require("../middleware/asyncHandler");
const {
  getBootstrapStatus,
  bootstrapAdmin,
  loginAdmin,
  getCurrentAdmin,
  logoutAdmin
} = require("../controllers/adminAuthController");

const router = express.Router();

router.get("/bootstrap-status", asyncHandler(getBootstrapStatus));
router.post("/bootstrap", asyncHandler(bootstrapAdmin));
router.post("/login", asyncHandler(loginAdmin));
router.get("/me", adminAuth, asyncHandler(getCurrentAdmin));
router.post("/logout", adminAuth, asyncHandler(logoutAdmin));

module.exports = router;

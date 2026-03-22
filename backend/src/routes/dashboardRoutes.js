const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const {
  getOverview,
  getSummary,
  getDoctorPerformance,
  getDepartmentFlow
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/overview", asyncHandler(getOverview));
router.get("/summary", asyncHandler(getSummary));
router.get("/doctor-performance", asyncHandler(getDoctorPerformance));
router.get("/department-flow", asyncHandler(getDepartmentFlow));

module.exports = router;

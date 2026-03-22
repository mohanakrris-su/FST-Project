const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { getDoctors, getQueues, getAppointments } = require("../controllers/resourceController");

const router = express.Router();

router.get("/doctors", asyncHandler(getDoctors));
router.get("/queues", asyncHandler(getQueues));
router.get("/appointments", asyncHandler(getAppointments));

module.exports = router;

const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const {
  getQueuePredictionController,
  getAppointmentPredictionController
} = require("../controllers/predictionController");

const router = express.Router();

router.get("/queue/:queueId", asyncHandler(getQueuePredictionController));
router.get("/appointment/:appointmentId", asyncHandler(getAppointmentPredictionController));

module.exports = router;

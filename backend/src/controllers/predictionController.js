const { getQueuePrediction, getAppointmentPrediction } = require("../services/waitTimeService");

async function getQueuePredictionController(req, res) {
  const queuePrediction = await getQueuePrediction(
    req.params.queueId,
    req.query.manualAverageMinutes
  );

  if (!queuePrediction) {
    return res.status(404).json({ message: "Queue not found." });
  }

  res.json(queuePrediction);
}

async function getAppointmentPredictionController(req, res) {
  const prediction = await getAppointmentPrediction(
    req.params.appointmentId,
    req.query.manualAverageMinutes
  );

  if (!prediction) {
    return res.status(404).json({ message: "Appointment not found." });
  }

  res.json(prediction);
}

module.exports = {
  getQueuePredictionController,
  getAppointmentPredictionController
};

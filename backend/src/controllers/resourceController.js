const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Queue = require("../models/Queue");

async function getDoctors(req, res) {
  const doctors = await Doctor.find({ active: true }).sort({ name: 1 });
  res.json({ doctors });
}

async function getQueues(req, res) {
  const date = req.query.date || new Date().toISOString().split("T")[0];
  const queues = await Queue.find({ date }).populate("doctorId").sort({ createdAt: 1 });

  res.json({
    date,
    queues: queues.map((queue) => ({
      id: queue._id,
      date: queue.date,
      status: queue.status,
      waitingCount: queue.waiting.length,
      skippedCount: queue.skipped.length,
      currentPatient: queue.currentPatient,
      doctor: queue.doctorId
        ? {
            id: queue.doctorId._id,
            name: queue.doctorId.name,
            doctorCode: queue.doctorId.doctorCode,
            departmentName: queue.doctorId.departmentName,
            status: queue.doctorId.status
          }
        : null
    }))
  });
}

async function getAppointments(req, res) {
  const query = {};

  if (req.query.queueId) {
    query.queueId = req.query.queueId;
  }

  if (req.query.doctorId) {
    query.doctorId = req.query.doctorId;
  }

  if (req.query.status) {
    query.status = req.query.status;
  }

  const appointments = await Appointment.find(query).sort({ tokenNumber: 1 });

  res.json({ appointments });
}

module.exports = {
  getDoctors,
  getQueues,
  getAppointments
};

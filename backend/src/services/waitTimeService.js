const Appointment = require("../models/Appointment");
const Queue = require("../models/Queue");

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function round(value, digits = 1) {
  return Number(value.toFixed(digits));
}

function minutesBetween(start, end) {
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
}

function getObservedDurations(appointments) {
  return appointments
    .filter((appointment) => appointment.inRoomAt && appointment.completedAt)
    .map((appointment) => minutesBetween(appointment.inRoomAt, appointment.completedAt));
}

function getAverageConsultationMinutes({ doctor, completedAppointments, manualAverageMinutes }) {
  if (manualAverageMinutes) {
    return clamp(round(Number(manualAverageMinutes), 1), 3, 60);
  }

  const baseline = doctor?.averageConsultationMinutes || 12;
  const observedDurations = getObservedDurations(completedAppointments);

  if (!observedDurations.length) {
    return baseline;
  }

  const observedAverage =
    observedDurations.reduce((sum, current) => sum + current, 0) / observedDurations.length;

  return clamp(round(observedAverage * 0.75 + baseline * 0.25, 1), 3, 60);
}

function getOperationalDelay(queue, doctor) {
  let delayMinutes = 0;
  const notes = [];

  if (queue.status === "PAUSED") {
    delayMinutes += 15;
    notes.push("Queue is currently paused.");
  }

  if (doctor.status === "BREAK") {
    delayMinutes += 10;
    notes.push("Doctor is currently on break.");
  }

  if (doctor.status === "OFFLINE" || queue.status === "CLOSED") {
    notes.push("Doctor or queue is currently unavailable.");
    return {
      blocked: true,
      delayMinutes,
      notes
    };
  }

  return {
    blocked: false,
    delayMinutes,
    notes
  };
}

function buildConfidence({ completedAppointments, manualAverageMinutes, blocked }) {
  if (blocked) {
    return 0.25;
  }

  if (manualAverageMinutes) {
    return 0.9;
  }

  const sampleSize = completedAppointments.length;
  return clamp(round(0.55 + Math.min(sampleSize, 8) * 0.04, 2), 0.55, 0.87);
}

function getCurrentPatientRemainingMinutes(currentPatient, averageConsultationMinutes) {
  if (!currentPatient) {
    return 0;
  }

  if (!currentPatient.inRoomAt) {
    return averageConsultationMinutes;
  }

  const elapsedMinutes = minutesBetween(currentPatient.inRoomAt, new Date());
  return Math.max(round(averageConsultationMinutes - elapsedMinutes, 1), 2);
}

function createExpectedTime(waitMinutes) {
  return new Date(Date.now() + waitMinutes * 60000);
}

function createQueuePredictionResponse({
  queue,
  doctor,
  averageConsultationMinutes,
  completedAppointments,
  operationalDelay
}) {
  const currentPatient = queue.currentPatient;
  const currentPatientRemaining = getCurrentPatientRemainingMinutes(
    currentPatient,
    averageConsultationMinutes
  );
  const confidence = buildConfidence({
    completedAppointments,
    blocked: operationalDelay.blocked
  });

  const predictionItems = [];

  if (currentPatient) {
    predictionItems.push({
      appointmentId: currentPatient._id,
      patientName: currentPatient.patientName,
      tokenNumber: currentPatient.tokenNumber,
      status: currentPatient.status,
      patientsAhead: 0,
      predictedWaitMinutes: 0,
      expectedConsultationTime: new Date(),
      note: "Patient is already in the room."
    });
  }

  queue.waiting.forEach((appointment, index) => {
    const patientsAhead = index + (currentPatient ? 1 : 0);
    const predictedWaitMinutes =
      operationalDelay.delayMinutes +
      currentPatientRemaining +
      index * averageConsultationMinutes;

    predictionItems.push({
      appointmentId: appointment._id,
      patientName: appointment.patientName,
      tokenNumber: appointment.tokenNumber,
      status: appointment.status,
      patientsAhead,
      predictedWaitMinutes: round(predictedWaitMinutes, 1),
      expectedConsultationTime: operationalDelay.blocked
        ? null
        : createExpectedTime(predictedWaitMinutes),
      note: operationalDelay.notes.join(" ")
    });
  });

  queue.skipped.forEach((appointment) => {
    predictionItems.push({
      appointmentId: appointment._id,
      patientName: appointment.patientName,
      tokenNumber: appointment.tokenNumber,
      status: appointment.status,
      patientsAhead: null,
      predictedWaitMinutes: null,
      expectedConsultationTime: null,
      note: "Skipped appointments need to rejoin the waiting queue before prediction."
    });
  });

  return {
    queueId: queue._id,
    queueStatus: queue.status,
    doctor: {
      id: doctor._id,
      name: doctor.name,
      doctorCode: doctor.doctorCode,
      status: doctor.status,
      departmentName: doctor.departmentName
    },
    averageConsultationMinutes,
    currentPatientRemainingMinutes: currentPatient ? currentPatientRemaining : 0,
    confidence,
    notes: operationalDelay.notes,
    predictions: predictionItems
  };
}

async function getQueuePrediction(queueId, manualAverageMinutes) {
  const queue = await Queue.findById(queueId)
    .populate("doctorId")
    .populate("currentPatient")
    .populate("waiting")
    .populate("skipped");

  if (!queue) {
    return null;
  }

  const doctor = queue.doctorId;
  const completedAppointments = await Appointment.find({
    doctorId: doctor._id,
    queueDate: queue.date,
    status: "COMPLETED"
  }).sort({ completedAt: -1 });

  const averageConsultationMinutes = getAverageConsultationMinutes({
    doctor,
    completedAppointments,
    manualAverageMinutes
  });

  const operationalDelay = getOperationalDelay(queue, doctor);

  return createQueuePredictionResponse({
    queue,
    doctor,
    averageConsultationMinutes,
    completedAppointments,
    operationalDelay
  });
}

async function getAppointmentPrediction(appointmentId, manualAverageMinutes) {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    return null;
  }

  const queuePrediction = await getQueuePrediction(appointment.queueId, manualAverageMinutes);

  if (!queuePrediction) {
    return {
      appointment,
      prediction: null
    };
  }

  const prediction = queuePrediction.predictions.find(
    (item) => String(item.appointmentId) === String(appointment._id)
  );

  if (prediction && prediction.expectedConsultationTime) {
    appointment.expectedConsultationTime = prediction.expectedConsultationTime;
    appointment.predictedWaitMinutes = prediction.predictedWaitMinutes;
    appointment.predictionConfidence = queuePrediction.confidence;
    await appointment.save();
  }

  return {
    appointment,
    queuePredictionMeta: {
      averageConsultationMinutes: queuePrediction.averageConsultationMinutes,
      confidence: queuePrediction.confidence,
      queueStatus: queuePrediction.queueStatus,
      notes: queuePrediction.notes
    },
    prediction
  };
}

module.exports = {
  getAverageConsultationMinutes,
  getQueuePrediction,
  getAppointmentPrediction
};

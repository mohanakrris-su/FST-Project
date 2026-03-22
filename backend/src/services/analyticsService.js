const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Queue = require("../models/Queue");

function round(value, digits = 1) {
  return Number(value.toFixed(digits));
}

function getDateString(dateValue) {
  if (dateValue) {
    return dateValue;
  }

  return new Date().toISOString().split("T")[0];
}

function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, current) => sum + current, 0) / values.length;
}

function getConsultationMinutes(appointment) {
  if (!appointment.inRoomAt || !appointment.completedAt) {
    return null;
  }

  const diff = appointment.completedAt.getTime() - appointment.inRoomAt.getTime();
  return Math.max(1, Math.round(diff / 60000));
}

function makeAlert(type, message, severity) {
  return { type, message, severity };
}

async function loadDayData(dateString) {
  const effectiveDate = getDateString(dateString);

  const [appointments, doctors, queues] = await Promise.all([
    Appointment.find({ queueDate: effectiveDate }).sort({ tokenNumber: 1 }).lean(),
    Doctor.find({ active: true }).lean(),
    Queue.find({ date: effectiveDate }).lean()
  ]);

  return {
    date: effectiveDate,
    appointments,
    doctors,
    queues
  };
}

async function buildHospitalSummary(dateString) {
  const { date, appointments, doctors, queues } = await loadDayData(dateString);

  const completedDurations = appointments
    .map(getConsultationMinutes)
    .filter((duration) => duration !== null);

  const waitingCount = appointments.filter((item) => item.status === "WAITING").length;
  const skippedCount = appointments.filter((item) => item.status === "SKIPPED").length;
  const inRoomCount = appointments.filter((item) => item.status === "IN_ROOM").length;
  const completedCount = appointments.filter((item) => item.status === "COMPLETED").length;
  const cancelledCount = appointments.filter((item) => item.status === "CANCELLED").length;
  const revenueToday = appointments.reduce((sum, item) => sum + (item.paymentAmount || 0), 0);

  const pausedQueues = queues.filter((queue) => queue.status === "PAUSED").length;
  const closedQueues = queues.filter((queue) => queue.status === "CLOSED").length;
  const activeDoctors = doctors.filter((doctor) => doctor.status !== "OFFLINE").length;

  const alerts = [];

  if (pausedQueues > 0) {
    alerts.push(makeAlert("queue", `${pausedQueues} queue(s) are paused right now.`, "medium"));
  }

  if (waitingCount > Math.max(activeDoctors, 1) * 8) {
    alerts.push(
      makeAlert(
        "load",
        "Waiting load is climbing faster than active doctor capacity.",
        "high"
      )
    );
  }

  if (skippedCount > 0) {
    alerts.push(
      makeAlert("patient_flow", `${skippedCount} patient(s) are currently in skipped flow.`, "low")
    );
  }

  return {
    date,
    generatedAt: new Date(),
    summary: {
      totalAppointments: appointments.length,
      waitingCount,
      skippedCount,
      inRoomCount,
      completedCount,
      cancelledCount,
      revenueToday,
      activeDoctors,
      totalQueues: queues.length,
      pausedQueues,
      closedQueues,
      averageConsultationMinutes: round(
        average(
          completedDurations.length
            ? completedDurations
            : doctors.map((item) => item.averageConsultationMinutes || 12)
        ),
        1
      )
    },
    alerts
  };
}

async function buildDoctorPerformance(dateString) {
  const { date, appointments, doctors, queues } = await loadDayData(dateString);
  const queuesByDoctor = new Map(queues.map((queue) => [String(queue.doctorId), queue]));

  return doctors
    .map((doctor) => {
      const doctorAppointments = appointments.filter(
        (appointment) => String(appointment.doctorId) === String(doctor._id)
      );
      const consultationDurations = doctorAppointments
        .map(getConsultationMinutes)
        .filter((duration) => duration !== null);
      const queue = queuesByDoctor.get(String(doctor._id));
      const averageMinutes = round(
        average(
          consultationDurations.length
            ? consultationDurations
            : [doctor.averageConsultationMinutes || 12]
        ),
        1
      );
      const waitingCount = doctorAppointments.filter((item) => item.status === "WAITING").length;
      const patientsSeenToday = doctorAppointments.filter((item) => item.status === "COMPLETED").length;
      const bookedCount = doctorAppointments.length;
      const fillRate = doctor.dailyCapacity
        ? round((bookedCount / doctor.dailyCapacity) * 100, 1)
        : 0;

      return {
        date,
        doctorId: doctor._id,
        queueId: queue ? queue._id : null,
        doctorName: doctor.name,
        doctorCode: doctor.doctorCode,
        departmentName: doctor.departmentName,
        status: doctor.status,
        queueStatus: queue ? queue.status : "NOT_CREATED",
        patientsSeenToday,
        waitingCount,
        skippedCount: doctorAppointments.filter((item) => item.status === "SKIPPED").length,
        inRoomCount: doctorAppointments.filter((item) => item.status === "IN_ROOM").length,
        cancelledCount: doctorAppointments.filter((item) => item.status === "CANCELLED").length,
        averageConsultationMinutes: averageMinutes,
        projectedBacklogMinutes: round(waitingCount * averageMinutes, 1),
        bookedCount,
        dailyCapacity: doctor.dailyCapacity || 0,
        fillRate
      };
    })
    .sort((left, right) => right.waitingCount - left.waitingCount);
}

async function buildDepartmentFlow(dateString) {
  const { date, appointments, doctors } = await loadDayData(dateString);
  const departments = new Map();

  doctors.forEach((doctor) => {
    if (!departments.has(doctor.departmentName)) {
      departments.set(doctor.departmentName, {
        date,
        departmentName: doctor.departmentName,
        doctorsActive: 0,
        appointmentsBooked: 0,
        completed: 0,
        waiting: 0,
        skipped: 0,
        cancelled: 0,
        revenue: 0,
        averageConsultationMinutes: 0,
        averagePredictedWaitMinutes: 0
      });
    }

    departments.get(doctor.departmentName).doctorsActive += doctor.status === "OFFLINE" ? 0 : 1;
  });

  departments.forEach((department) => {
    const departmentAppointments = appointments.filter(
      (appointment) => appointment.departmentName === department.departmentName
    );
    const durations = departmentAppointments
      .map(getConsultationMinutes)
      .filter((duration) => duration !== null);
    const predictedWaits = departmentAppointments
      .map((appointment) => appointment.predictedWaitMinutes)
      .filter((value) => typeof value === "number");

    department.appointmentsBooked = departmentAppointments.length;
    department.completed = departmentAppointments.filter((item) => item.status === "COMPLETED").length;
    department.waiting = departmentAppointments.filter((item) => item.status === "WAITING").length;
    department.skipped = departmentAppointments.filter((item) => item.status === "SKIPPED").length;
    department.cancelled = departmentAppointments.filter((item) => item.status === "CANCELLED").length;
    department.revenue = departmentAppointments.reduce(
      (sum, item) => sum + (item.paymentAmount || 0),
      0
    );
    department.averageConsultationMinutes = round(
      average(durations.length ? durations : [12]),
      1
    );
    department.averagePredictedWaitMinutes = round(
      average(predictedWaits.length ? predictedWaits : [0]),
      1
    );
  });

  return Array.from(departments.values()).sort((left, right) => right.waiting - left.waiting);
}

module.exports = {
  buildHospitalSummary,
  buildDoctorPerformance,
  buildDepartmentFlow
};

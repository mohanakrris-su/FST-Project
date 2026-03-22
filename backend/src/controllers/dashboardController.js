const {
  buildHospitalSummary,
  buildDoctorPerformance,
  buildDepartmentFlow
} = require("../services/analyticsService");

async function getOverview(req, res) {
  const date = req.query.date;
  const [summary, doctorPerformance, departmentFlow] = await Promise.all([
    buildHospitalSummary(date),
    buildDoctorPerformance(date),
    buildDepartmentFlow(date)
  ]);

  res.json({
    ...summary,
    doctorPerformance,
    departmentFlow
  });
}

async function getSummary(req, res) {
  const summary = await buildHospitalSummary(req.query.date);
  res.json(summary);
}

async function getDoctorPerformance(req, res) {
  const doctorPerformance = await buildDoctorPerformance(req.query.date);
  res.json({
    date: req.query.date || new Date().toISOString().split("T")[0],
    doctorPerformance
  });
}

async function getDepartmentFlow(req, res) {
  const departmentFlow = await buildDepartmentFlow(req.query.date);
  res.json({
    date: req.query.date || new Date().toISOString().split("T")[0],
    departmentFlow
  });
}

module.exports = {
  getOverview,
  getSummary,
  getDoctorPerformance,
  getDepartmentFlow
};

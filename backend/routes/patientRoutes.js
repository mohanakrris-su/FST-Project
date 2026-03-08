const exp=require("../controllers/patientController.js")
const route=require('express').Router();
route.get("/getPatients",exp.getPatients)
route.get("/getPatientById/:id",exp.getPatientById)
route.post("/updatePatients/:id",exp.updatePatient)
route.get("/deletePatients/:id",exp.deletePatient)
route.post("/bookAppointment",exp.bookAppointment)
route.post("/removeAppointment/:appId",exp.removeAppointment)
route.get("/getQr/:appId",exp.getQrCode);
route.get("/addRecord",exp.addRecord);
route.get("/getReportsToday/:pId",exp.getTodayReports);
route.get("/getReports/:pId",exp.getReports);
route.get("/getBookings/:pId",exp.getBookings);
module.exports=route;
const exp=require("../controllers/patientController.js");
const { makePayment, createOrder, getPayment } = require("../controllers/paymentController.js");
const { viewCurrentPatientByqueueId, viewCurrentPatientBydoctorId } = require("../controllers/queueController.js");
const route=require('express').Router();
route.get("/getPatients",exp.getPatients)
route.get("/getPatientById/:id",exp.getPatientById)
route.post("/updatePatients/:id",exp.updatePatient)
route.get("/deletePatients/:id",exp.deletePatient)
route.post("/bookAppointment",exp.bookAppointment)
route.post("/removeAppointment/:appId",exp.removeAppointment)
route.get("/getPosition/:appId",exp.getPosition);
route.get("/getQr/:appId",exp.getQrCode);
route.get("/addRecord",exp.addRecord);
route.get("/getReportsToday/:pId",exp.getTodayReports);
route.get("/getReports/:pId",exp.getReports);
route.get("/getBookings/:pId",exp.getBookings);
route.post("/payment",makePayment);
route.post("/create-order",createOrder);
route.get("/getPatientHistory/:patientId",exp.getPatientHistory);
route.get("/sendSms",exp.sms);
route.get("/getLiveQueue/:doctorId",exp.getLiveQueue);
route.get("/rejoin/Queue/:appointmentId",exp.rejoinQueue);
route.get("/nextPatient/:queueId",exp.nextPatient);
route.get("/skipAppointment/:appointmentId",exp.skipAppointment);
route.get("/getAppointments/patient/:patientId",exp.getAppointmentsByPatient);
route.get("/getAppointment/:appointmentId",exp.getAppointment);
route.get("/getAppointmentQr/:appointmentId",exp.getAppointmentQR);
route.get("/getpaymentById/:paymentId",getPayment);
route.get("/viewCurrentPatient/QueueId/:queueId",viewCurrentPatientByqueueId);
route.get("/viewCurrentPatient/DoctorId/:doctorId",viewCurrentPatientBydoctorId)
module.exports=route;
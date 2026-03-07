const { getPatientById, getPatients, updatePatient, deletePatient, bookAppointment, removeAppointment } = require('../controllers/patientController,');

const route=require('express').Router();
route.get("/getPatients",getPatients)
route.get("/getPatientById",getPatientById)
route.post("/updatePatients",updatePatient)
route.post("/deletePatients",deletePatient)
route.post("/bookAppointment",bookAppointment)
route.post("/removeAppointment",removeAppointment)
module.exports=route;
const exp=require("../controllers/patientController.js")
const route=require('express').Router();
route.get("/getPatients",exp.getPatients)
route.get("/getPatientById/:id",exp.getPatientById)
route.post("/updatePatients/:id",exp.updatePatient)
route.get("/deletePatients/:id",exp.deletePatient)
route.post("/bookAppointment",exp.bookAppointment)
route.post("/removeAppointment/:appId",exp.removeAppointment)
module.exports=route;
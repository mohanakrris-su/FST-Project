const Patient = require("../models/Patient.js")
const Patient=require("../models/Patient.js");
const Queue = require("../models/Queue.js");
const appointment=require("../models/Appointment.js");
const Appointment = require("../models/Appointment.js");
const Payment = require("../models/Payment.js");
const QRCode = require("qrcode");
async function getPatients(req,res){
    try{
    const patients=await Patient.find();
        res.json(patients);
    }
    catch(error)
    {
        res.status(500).json({error:error.message});
    }
}
async function getPatientById(req,res){
    try{
    const id=req.params.id;
    const patient=await Patient.findById(id);
        res.json(patient);
    }
    catch(error)
    {
        res.status(500).json({error:error.message});
    }
}
async function updatePatient(req,res){
      try{
    const id=req.params.id;
    const patient=await Patient.findByIdAndUpdate(id,req.body,{new:true});
        res.json(patient);
    }
    catch(error)
    {
        res.status(500).json({error:error.message});
    }
}
async function deletePatient(req,res){
      try{
    const id=req.params.id;
    await Patient.findByIdAndDelete(id);
        res.json(patient);
    }
    catch(error)
    {
        res.status(500).json({error:error.message});
    }
}

async function bookAppointment(req,res){
    try{
              const { patientId, doctorId, departmentId, paymentId } = req.body;
              const payment=await Payment.findById(paymentId);
              if(!payment||payment.status!=="PAID")
              {
                return res.status(500).json({
                    message:"Payment required before booking appointment "
                })
              }
                  const today = new Date().toISOString().split("T")[0];

              let queue=await Queue.findOne({
                doctorId,date:today
              })
              if(!queue)
              {
                    res.status(500).json({msg:"not foun"});
              }
              const tokenNumber=queue.waiting.length+1;
               const qrData = {
      patientId,
      doctorId,
      tokenNumber,
      date:today
    };
    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData))
              const appointment=await new Appointment({
                patientId,
                doctorId,
                departmentId,
                queueId,
                paymentId,
                tokenNUmber,
                status:"WAITING",
                qrcode:qrCodeImage
              })
              await appointment.save();
              queue.waiting.push(appointment._id);
              await queue.save();
              res.json({msg:"appointment booked successfully",tokenNumber,qrCode:qrCodeImage,appointment});
            }
            catch(err)
            {
                res.status(500).json({error:err});
            }
}
async function removeAppointment(req,res){
    try{    
    const appointmentId=req.params.appId;
        await Appointment.findByIdAndDelete(appointmentId);
        const payment=await Payment.findOne(appointmentId);
        if(!payment)
        {
            res.json({msg:"failed"});
        }
        payment.status="REFUNDED";
        await payment.save();
        res.json({msg:"deleted successfully"});
    }
    catch(err)
    {
        res.status(500).json({error:err});
    }
}
module.exports={getPatientById,getPatients,deletePatient,bookAppointment,removeAppointment,updatePatient};

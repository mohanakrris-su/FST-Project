const Patient=require("../models/Patient.js");
const Queue = require("../models/Queue.js");
const Appointment = require("../models/Appointment.js");
const Payment = require("../models/Payment.js");
const QRCode = require("qrcode");
async function registerPatient(req,res){
   try{
    const {name,phone,email,password,age,gender}=req.body;
        const p=await Patient.findOne({email});
        if(p)
            return res.status(404).json({msg:"already registered"});
        const patient=await new Patient({
            name,
            phone,email,password,age,gender
        });
     await patient.save();
     res.json({msg:"registered already"});
}
catch(err)
{
    res.status(500).json({error:err});
}
};
async function loginPatient(req,res)
{
    
}
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
    const patient=await Patient.findByIdAndUpdate(id,req.body);
        res.json(patient);
    }
    catch(error)
    {
        res.status(500).json({error:error.message});
    }
}
async function deletePatient(req, res) {
  try {

    const id = req.params.id;
    console.log(id);
    const pa = await Patient.findById(id);
console.log(pa);
    const patient = await Patient.findByIdAndDelete(id);

     if (!patient) {
       return res.status(404).json({
         message: "Patient not found"
       });
     }

    res.json({
      message: "Patient deleted successfully",
      deletedPatient: patient
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
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
                 const today = new Date();
const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // today 00:00:00
const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1); // tomorrow 00:00:00


             let queue = await Queue.findOne({
  doctorId,
  date: { $gte: startOfDay, $lt: endOfDay }
});
              if(!queue)
              {
                   return  res.status(500).json({msg:"not found"});
              }
              console.log(queue);
              const tokenNumber=queue.waiting.length+1;
               const qrData = {
      patientId,
      doctorId,
      tokenNumber,
      date:today
    };
    const queueId=queue._id;

    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData));
    console.log(qrCodeImage);
              const appointment=await new Appointment({
                patientId,
                doctorId,
                departmentId,
                queueId,
                paymentId,
                tokenNumber,
                status:"WAITING",
                qrCode:qrCodeImage
              })
              await appointment.save();
              queue.waiting.push(appointment._id);
              await queue.save();
              console.log(queue);
              return res.json({msg:"appointment booked successfully",tokenNumber,qrCode:qrCodeImage,appointment});
            }
            catch(err)
            {
                res.status(500).json({error:err});
            }
}
async function removeAppointment(req,res){
    try{    
    const appointmentId=req.params.appId;
        const app=await Appointment.findById(appointmentId)
        if(!app)
        {
            res.status(500).json({err:"appointment not found"});
        }
        const queueId= app.queueId;
        const payment=await Payment.findById(app.paymentId);
        if(!payment)
        {
            res.json({msg:"failed"});
        }
        payment.status="REFUNDED";
        await Queue.updateOne({_id:queueId},{
            $pull:{
                waiting:appointmentId }
            })
        await payment.save();
        app.status="CANCELLED";
        await app.save();
        res.json({msg:"deleted successfully"});
    }
    catch(err)
    {
        res.status(500).json({error:err});
    }
}
module.exports={getPatientById,getPatients,deletePatient,bookAppointment,removeAppointment,updatePatient};

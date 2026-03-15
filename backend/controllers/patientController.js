const Patient=require("../models/Patient.js");
const Queue = require("../models/Queue.js");
const Appointment = require("../models/Appointment.js");
const Payment = require("../models/Payment.js");
const QRCode = require("qrcode");
 const twilio=require("twilio");
const client=twilio(
"ACd063c95660a15649624afcf15da90467",
"30ab7f715687ba54c5b6b5069fd405f7"
);
async function registerPatient(req,res){
   try{
    const {name,phone,email,password,age,gender}=req.body;
        const p=await Patient.findOne({email});
        if(p)
            return res.status(404).json({msg:"already registered",found:false});
        const patient=await new Patient({
            name,
            phone,email,password,age,gender
        });
     await patient.save();
     res.json({msg:"registered successfully",patientId:patient._id,found:true});
}
catch(err)
{
    res.status(500).json({error:err});
}
};
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
    if(!patient)
            return res.status(404).json({found:false,msg:"not found"});
    res.json({patient,found:true});
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
    if(!patient)
            return res.status(404).json({found:false,msg:"not found"});
    res.json({patient,found:true});
    }
    catch(error)
    {
        res.status(500).json({error:error.message});
    }
}
async function deletePatient(req, res) {
  try {
    const id = req.params.id;
    const pa = await Patient.findById(id);
console.log(pa);
    const patient = await Patient.findByIdAndDelete(id);
     if (!patient) {
       return res.status(404).json({
         message: "Patient not found",found:false
       });
     }

    res.json({
      message: "Patient deleted successfully",
      deletedPatient: patient,found:true
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}
async function bookAppointment(req, res) {
    try {
        const { patientId, doctorId, departmentId, paymentId } = req.body;
        const payment = await Payment.findById(paymentId);
        if (!payment || payment.status !== "PAID") {
            return res.status(402).json({message: "Payment required before booking appointment",found:false});}
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        let queue = await Queue.findOne({
            doctorId,
            Date: { $gte: startOfDay, $lt: endOfDay } 
        });
        if (!queue) {
            return res.status(404).json({ msg: "Queue not found for today" ,found:false});
        }
        const tokenNumber = queue.waiting.length + 1;
        const appointment = new Appointment({
            patientId,
            doctorId,
            departmentId,
            queueId: queue._id,
            paymentId,
            tokenNumber,
            status: "WAITING"
        });
        const qrData = {
            appointmentId: appointment._id,
            patientId,
            doctorId,
            tokenNumber,
            date: today
        };
        const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData));
        appointment.qrCode = qrCodeImage;
        await appointment.save();
        queue.waiting.push(appointment._id);
        await queue.save();
        return res.status(201).json({
            msg: "Appointment booked successfully",
            tokenNumber,
            qrCode: qrCodeImage,
            appId:appointment._id
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}
async function removeAppointment(req,res){
    try{    
    const appointmentId=req.params.appId;
        const app=await Appointment.findById(appointmentId)
        if(!app)
        {
            res.status(500).json({err:"appointment not found",found:false});
        }
        const queueId= app.queueId;
        const payment=await Payment.findById(app.paymentId);
        if(!payment)
        {
            res.json({msg:"failed",found:false});
        }
        payment.status="REFUNDED";
        await Queue.updateOne({_id:queueId},{
            $pull:{
                waiting:appointmentId }
            })
        await payment.save();
        app.status="CANCELLED";
        await app.save();
        res.json({msg:"deleted successfully",appId:app._id,found:true});
    }
    catch(err)
    {
        res.status(500).json({error:err});
    }
}
async function getPosition(req, res)
{
    try
    {
        const appId = req.params.appId;
        const app = await Appointment.findById(appId);
        if(!app)
            return res.status(404).json({err:"appointment not found",found:false});
        const q = await Queue.findById(app.queueId);
        if(!q)
            return res.status(404).json({error:"queue invalid for the corresponding appId in the db",found:false});
        if(q.currentPatient && q.currentPatient.toString() === appId)
            return res.json({appId,currentPatient:true,position:0,found:true});

        const idx = q.waiting.findIndex((i)=>i.toString()===appId);
        if(idx!==-1)
            return res.json({appId,currentPatient:false,position:idx+1,waitingPatient:true,found:true});

        const idx1 = q.skipped.findIndex((i)=>i.toString()===appId);
        if(idx1!==-1)
            return res.json({appId,currentPatient:false,position:idx1+1,skippedPatient:true,found:true});

        return res.status(404).json({error:"cant able to find the appointment in the queue",found:false
        });
    }
    catch(err)
    {
        res.status(500).json({error:err.message});
    }
}
async function getQrCode(req,res)
{
    const appId=req.params.appId;
    const app=await Appointment.findById(appId);
    if(!app)
            return res.status(400).json({msg:"queue not found",found:false});
    const qrString=app.qrCode;
    if(qrString=="")
            return res.json({qrCode:false,found:false});
    res.json({qrCode:true,qr:qrString,found:true});
}
async function addRecord(req,res)
{
    try
    {
        const {pId,fileUrl}=req.body;
        const p=await Patient.findById(pId);
        if(!p)
            return res.status(404).json({msg:"patient not found",found:false});
        p.reports.push({fileUrl});
        await p.save();
        res.json({msg:"record added successfully",fileUrl,found:true});
    }
    catch(err)
    {
        res.status(500).json({error:err.message});
    }
}
async function getTodayReports(req,res)
{
    try
    {
        const pId=req.params.pId;
        const p=await Patient.findById(pId);
        if(!p)
            return res.status(404).json({msg:"patient not found",found:false});
        const today=new Date();
        const startOfDay=new Date(today.getFullYear(),today.getMonth(),today.getDate());
        const endOfDay=new Date(today.getFullYear(),today.getMonth(),today.getDate()+1);
        const reports=p.reports.filter((r)=>
            r.uploadedAt>=startOfDay && r.uploadedAt<endOfDay
        );
        res.json({patientId:pId,todayReports:reports,found:true});
    }
    catch(err)
    {
        res.status(500).json({error:err.message});
    }
}
async function getReports(req,res)
{
 try
 {   const pId=req.params.pId;
    const p=await Patient.findById(pId);
    if(!p)
        return res.status(404).json({msg:"patient not found",found:false});
    const records=p.reports;
    res.json({reports:records,found:true});
}
catch(err)
{
    res.status(500).json({error:err})
}
}
async function getBookings(req,res)
{
    try{
        const pId = req.params.pId;
        const app = await Appointment.find({ patientId: pId });
        if(app.length === 0)
        {
            return res.json({msg:"no appointments before",found:false});
        }
        const app1 = app.map(a => ({appointmentId: a._id,status: a.status}));
        res.json({records:app1,found:true});
    }
    catch(err)
    {
        res.status(500).json({error:err.message});
    }
}
async function getPatientHistory(req,res)
{
    try{
    const patientId=req.params.patientId;
    const history=await Appointment.find({patientId:patientId})
    .populate("doctorId","name")
    .populate("departmentId","name")
    .populate("paymentId","amount status")
    .sort({createdAt:-1});
    if(!history || history.length===0)
        return res.status(404).json({msg:"no booking history found",found:false});
    res.status(200).json({
        count:history.length,
        bookings:history
    });
    }
    catch(err)
    {
        res.status(500).json({error:err.message});
    }
}
async function sms(req,res)
{
try{
const msg=await client.messages.create({
body:"booked successfully",
from:"+13012843236",
to:"+916369378885"
});
res.json({msg});
}
catch(err){
res.status(500).json({error:err.message});
};
}
async function getLiveQueue(req,res)
{
    try{
    const doctorId=req.params.doctorId;
    const today=new Date();
    const startOfDay=new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );
    const endOfDay=new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()+1
    );
    const q=await Queue.findOne({
        doctorId:doctorId,
        Date:{
            $gte:startOfDay,
            $lt:endOfDay
        }
    });
    if(!q)
        return res.status(404).json({msg:"today queue not found",found:false});
    const waitingCount=q.waiting.length;
    const skippedCount=q.skipped.length;
    const avgConsultTime=5;
    const estimatedWait=waitingCount*avgConsultTime;
    res.status(200).json({
        queueId:q._id,
        currentPatient:q.currentPatient,
        waitingCount:waitingCount,
        skippedCount:skippedCount,
        estimatedWait:estimatedWait+" minutes",
        found:true
    });
    }                                                                                             
    catch(err)
    {
        res.status(500).json({error:err.message});
    }
}
async function rejoinQueue(req,res)
{
    try{
    const appId=req.params.appointmentId;
      const today=new Date();
    const startOfDay=new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );
    const endOfDay=new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()+1
    );
    const q=await Queue.findOne({skipped:appId,Date:{
            $gte:startOfDay,
            $lt:endOfDay
        }});
    if(!q)
        return res.status(404).json({msg:"appointment not found in skipped queue",found:false});
    const idx=q.skipped.findIndex(
        i=>i.toString()===appId
    );
    if(idx===-1)
        return res.status(400).json({msg:"appointment not in skipped queue",found:false});
    const [removed]=q.skipped.splice(idx,1);
    const app=await Appointment.findById(appId);
    if(!app)
        return res.status(404).json({msg:"appointment not found",found:false});
    const bookedTime=app.bookedAt;
    let insertIndex=q.waiting.length;
    for(let i=0;i<q.waiting.length;i++)  
    {
        const wApp=await Appointment.findById(q.waiting[i]);
        if(bookedTime < wApp.bookedAt)
        {
            insertIndex=i;
            break;
        }
    }
    q.waiting.splice(insertIndex,0,removed);
    await q.save();
    res.status(200).json({
        msg:"patient rejoined queue based on booking time",
        position:insertIndex+1,
        found:true
    });
    }
    catch(err)
    {
        res.status(500).json({error:err.message});
    }
}
async function nextPatient(req, res) {
    try {
        const queueId = req.params.queueId;
        const q = await Queue.findById(queueId);
        if (!q) return res.status(404).json({ msg: "Queue not found",found:false});
        if (q.waiting.length === 0)
            return res.status(400).json({ msg: "No patients in waiting queue",found:false});
        const nextAppId = q.waiting.shift(); // remove first
        q.currentAppointment = nextAppId;
        var d=q.doctorId;
        var doctor=await Doctor.findById(d);
        doctor.status="in_room";
        await doctor.save();
        var c=await Appointment.findById(nextAppId);
        c.status="IN_ROOM";
        await c.save();
        await q.save();
        res.status(200).json({
            msg: "Moved to next patient",
            appointmentId: nextAppId,
            found:true
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function skipAppointment(req, res) {
    try {
        const appId = req.params.appointmentId;
        const q = await Queue.findOne({ waiting: appId });
        if (!q) return res.status(404).json({ msg: "Appointment not found in waiting queue",found:false });
        const idx = q.waiting.findIndex(id => id.toString() === appId);
        const [removed] = q.waiting.splice(idx, 1);
        q.skipped.push(removed);
        const a=await Appointment.findById(removed);
        a.status="SKIPPED";
        await a.save();
        await q.save();
        res.status(200).json({
            msg: "Appointment skipped",
            appointmentId: removed,
            skippedPosition: q.skipped.length,
            found:true
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function getAppointmentsByPatient(req, res) {
    try {
        const patientId = req.params.patientId;
        const appointments = await Appointment.find({ patient: patientId })
            .sort({ bookedAt: 1 }); 

        if (!appointments.length)
            return res.status(404).json({ msg: "No appointments found for this patient" ,found:false});

        res.status(200).json({appointments,found:true});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function getAppointment(req, res) {
    try {
        const appId = req.params.appointmentId;
        const appointment = await Appointment.findById(appId)
            .populate("patient", "name phone") 
            .populate("doctor", "name"); 
        if (!appointment)
            return res.status(404).json({ msg: "Appointment not found",found:false });

        res.status(200).json({appointment,found:true});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function getAppointmentQR(req, res) {
    try {
        const appId = req.params.appointmentId;
        const appointment = await Appointment.findById(appId);
        if (!appointment)
            return res.status(404).json({ msg: "Appointment not found",found:false });
        const qrData = await QRCode.toDataURL(JSON.stringify({
            appointmentId: appointment._id,
            patientId: appointment.patient,
            bookedAt: appointment.bookedAt
        }));
        res.status(200).json({
            appointmentId: appId,
            qr: qrData,
            found:true 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
module.exports={getPatientById,getPatients,deletePatient,bookAppointment,removeAppointment,updatePatient,getPosition,getQrCode,getTodayReports,getReports,addRecord,getBookings,getPosition,getPatientHistory,sms,getLiveQueue,rejoinQueue,nextPatient,skipAppointment,getAppointmentsByPatient,getAppointment,getAppointmentQR};

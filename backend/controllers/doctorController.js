const Appointment = require("../models/Appointment");
const Doctor=require("../models/Doctor");
const Queue=require("../models/Queue");
const Staff=require("../models/staff");
const StaffAssignment=require("../models/StaffAssignment");
async function addDoctor(req,res)
{
      try{
       const {name,id,phone,email,password,age,gender,hospitalId,departmentId}=req.body;
           const d=await Doctor.findOne({id});
           if(d)
               return res.status(404).json({msg:"already exists",already:true});
           const doctor=new Doctor({name,id,phone,email,password,age,gender,hospitalId,departmentId});
        await doctor.save();
        res.json({msg:"registered succesfully",already:false});
   }
   catch(err)
   {
       res.status(500).json({error:err});
   }
}
async function updateDoctor(req,res)
{
     try{
        const id=req.params.did;
       const {name,phone,email,password,age,gender}=req.body;
        const d=await Doctor.findOne({id});
        if(!d)
               return res.status(404).json({msg:"not exists",found:false});
        await Doctor.findOneAndUpdate({id},{name,phone,email,password,age,gender});
        res.json({msg:"updated succesfully",found:true});
   }
   catch(err)
   {
       res.status(500).json({error:err});
   }
}
async function getDoctors(req,res){
    try{
    const doctors=await Doctor.find();
        res.json({doctors});
    }
    catch(error)
    {
        res.status(500).json({error:error.message});
    }
}
async function getDoctorById(req,res){
    try{
    const id=req.params.id;
    const d=await Doctor.findOne({id});
    if(!d)
            return res.status(404).json({found:false,msg:"not found"});
    res.json({d,found:true});
    }
    catch(error)
    {
        res.status(500).json({error:error.message});
    }
}
async function deleteDoctor(req,res)
{
    try{
        const id=req.params.did;
         const d=await Doctor.findOne({id});
         if(!d)
                return res.status(404).json({msg:"not exists",found:false});
        await Doctor.findOneAndDelete({id});  
        res.json({msg:"successfully deleted",found:true});
    }
    catch(err)
    {
        res.status(500).json({error:err});
    }
}
async function getDoctorsByDept(req,res)
{
    try{
    const deptId=req.params.deptId;
    const doctors=await Doctor.find({departmentId:deptId});
    if(!doctors || doctors.length===0)
        return res.status(404).json({msg:"no doctors found in this department",found:false});
    res.status(200).json({
        count:doctors.length,
        doctors,
        found:true
    });
    }
    catch(err)
    {
        res.status(500).json({error:err.message});
    }
}
async function setCapacity(req,res)
{
    try
 {
    const {doctorId,capacity}=req.body;
     const mongoose = require("mongoose");
    const doctorId1 = new mongoose.Types.ObjectId(doctorId);
    var d=await Doctor.findById(doctorId1);
    if(!d)
        return res.status(404).json({err:"doctor not found",found:false});
    d.capacity=capacity;
    await d.save();
    res.json({doctorId,msg:"updated the capacity succcessfully",found:true});
}
catch(err)
{
    res.status(500).json({error:err.message});
}
}
async function updateDoctorStatus(req,res)
{
    try{
    //const doctorId=req.params.doctorId;
    const mongoose = require("mongoose");
const doctorId = new mongoose.Types.ObjectId(req.params.doctorId);
    console.log(doctorId);
    const {status}=req.body;
    const doctor=await Doctor.findById(doctorId);
    if(!doctor)
        return res.status(404).json({msg:"doctor not found",found:false});
    doctor.status=status;
    await doctor.save();
    const today=new Date().toISOString().split("T")[0];
    const queue=await Queue.findOne({
        doctorId:doctorId,
        date:today});
    if(queue)
    {
        if(status==="break")
            queue.status="PAUSED";
        else if(status==="offline")
            queue.status="CLOSED";
        else if(status==="available")
            queue.status="OPEN"

        await queue.save();
    }
    res.json({msg:"doctor status updated",doctorStatus:status,queueStatus:queue?queue.status:null,found:true});
    }
    catch(err)
    {
        res.status(500).json({error:err.message});
    }
}
async function getStatusAndCapacity(req,res)
{
    try
 {
    const doctorId=req.params.doctorId;
    const d=await Doctor.findOne({id:doctorId});
    if(!d)
        return res.status(404).json({msg:"not found",found:false});
    res.json({status:d.status,capacity:d.capacity,found:true});
}
catch(err)
{
    res.status(500).json({error:err.message});
}
}
async function createQueue(req,res)
{
    try{
        const {doctorId,staffId,capacity}=req.body;
        var d=await Doctor.findById(doctorId);
        if(!d)
            return res.status(404).json({msg:"doctor not found",found:false});
    const today=new Date().toISOString().split("T")[0];
        var qexist=await Queue.findOne({
            doctorId:doctorId,date:today});
        if(qexist)
            return res.status(400).json({msg:"queue already created today",found:false});
        var s=await Staff.findById(staffId);
        if(!s)
            return res.status(404).json({msg:"staff not found",found:false});
        var already=await StaffAssignment.findOne({
            staffId:staffId,
            assignedAt:today
        });
        console.log(already);
        if(already)
            return res.status(400).json({msg:"staff already assigned today",found:false});
        d.capacity=capacity;
        d.status="available";
        d.schedule.push({date:Date.now(),slots:capacity});
        await d.save();
        const q=new Queue({
            hospitalId:d.hospitalId,
            departmentId:d.departmentId,
            doctorId:d._id,
            status:"OPEN"
        });
        await q.save();
        const sa=new StaffAssignment({
            staffId:staffId,
            doctorId:d._id,
            departmentId:d.departmentId,
            hospitalId:d.hospitalId,
            queueId:q._id,
            assignedAt:today
        });
        await sa.save();
        res.status(201).json({msg:"queue created successfully",queueId:q._id,found:true});
    }
    catch(err)
    {
        res.status(500).json({error:err.message});
    }
}
async function markAsComplete(req,res)
{
    try{
    const queueId=req.params.queueId;
    const q=await Queue.findById(queueId);
     console.log("6");
    if(!q)  
        return res.status.json({found:false,msg:"queue not found",found:false});
   var  appointmentId=q.currentPatient;
    q.currentPatient=null;
    const appId=appointmentId;
    const a=await Appointment.findById(appId);
    a.status="COMPLETED";
 console.log("2");
    await q.save();
     console.log("3");
    await a.save();
    res.json({appointmentId:appId,msg:"sucussefully marked as completed",found:true});
    }
    catch(err)
    {
        res.status(500).json({error:err});
    }
}
async function addNotes(req,res)
{
 try
 {   const {notes}=req.body;
    const appId=req.params.appointmentId;
    const a=await Appointment.findById(appId);
    if(!a)
        return res.status(404).json({msg:"appointment not found ",found:false})
    a.notes=notes;
    await a.save();
    res.json({found:true,notes,appointment:a,found:true});
}
catch(err)
{
    res.status(500).json({error:err});
}
}
module.exports={addDoctor,deleteDoctor,updateDoctor,getDoctorsByDept,addNotes,markAsComplete,createQueue,getStatusAndCapacity,updateDoctorStatus,setCapacity,getDoctors,getDoctorById};
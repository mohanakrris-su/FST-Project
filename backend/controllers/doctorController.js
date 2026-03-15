const Appointment = require("../models/Appointment");
const Doctor=require("../models/Doctor");
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
    var d=await Doctor.findById(doctorId);
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
    const doctorId=req.params.doctorId;
    const {status}=req.body;
    const doctor=await Doctor.findById(doctorId);
    if(!doctor)
        return res.status(404).json({msg:"doctor not found",found:false});
    doctor.status=status;
    await doctor.save();
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
    const queue=await Queue.findOne({
        doctorId:doctorId,
        createdAt:{
            $gte:startOfDay,
            $lt:endOfDay
        }
    });
    if(queue)
    {
        if(status==="BREAK")
            queue.status="PAUSED";
        else if(status==="OFFLINE")
            queue.status="CLOSED";
        else if(status==="ONLINE")
            queue.status="OPENED"

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
    const d=await Doctor.findById(doctorId);
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
        var qexist=await Queue.findOne({
            doctorId:doctorId,createdAt:{$gte:startOfDay,$lt:endOfDay}});
        if(qexist)
            return res.status(400).json({msg:"queue already created today",found:false});
        var s=await Staff.findById(staffId);
        if(!s)
            return res.status(404).json({msg:"staff not found",found:false});
        var already=await StaffAssignment.findOne({
            staffId:staffId,
            createdAt:{
                $gte:startOfDay,
                $lt:endOfDay
            }
        });
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
            status:"OPENED"
        });
        await q.save();
        const sa=new StaffAssignment({
            staffId:staffId,
            doctorId:d._id,
            departmentId:d.departmentId,
            hospitalId:d.hospitalId,
            queueId:q._id
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
    const q=await Queue.find(queueId);
    if(!q)  
        return res.status.json({found:false,msg:"queue not found",found:false});
    q.currentPatient=null;
    const appId=q.appointmentId;
    const a=await Appointment.findById(appId);
    a.status="COMPLETED";
    await q.save();
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


module.exports={addDoctor,deleteDoctor,updateDoctor,getDoctorsByDept,addNotes,markAsComplete,createQueue,getStatusAndCapacity,updateDoctorStatus,setCapacity};
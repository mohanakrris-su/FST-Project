const Queue=require("../models/Queue");
const Doctor=require("../models/Doctor");
const Queue=require("../models/Queue");
const Doctor=require("../models/Doctor");

async function getQueueIdbyDid(req,res)
{
    try{
    const did=req.params.did;
    const d=await Queue.findOne({doctorId:did});
    if(!d)
        return res.status(404).json({msg:"queue is not available"});
    res.status(200).json({
        queueId:d._id
    });
    }
    catch(err)
    {
        res.status(500).json({error:err.message});
    }
}
async function getQueueStatus(req,res)
{
    const qid=req.params.queueId;
    const q=await Queue.findById(qid);
    if(!q)
    {
        return res.status(404).json({msg:"queue not found "});
    }
    res.json({queue:q});
}
const Queue=require("../models/Queue");
const StaffAssignment = require("../models/StaffAssignment");
const { getLiveQueue } = require("./patientController");

async function verifyPatient(req,res)
{
    try{
    const queueId=req.params.queueId;
    const appointmentId=req.params.appointmentId;
    const q=await Queue.findById(queueId);
    if(!q)
        return res.status(404).json({msg:"queue not found"});
    const idx=q.waiting.findIndex(
        i=>i.toString()===appointmentId
    );
    if(idx===-1)
        return res.status(400).json({msg:"patient not in waiting queue"});
    if(idx===0)
        return res.json({msg:"patient verified",allow:true});
    res.json({allow:false,msg:"patient must wait", position:idx+1});
    }
    catch(err)
    {
        res.status(500).json({error:err.message});
    }
}
async function insertPatient(req,res)
{
    try{
    const queueId=req.params.queueId;
    const {appointmentId,position}=req.body;
    const q=await Queue.findById(queueId);
    if(!q)
        return res.status(404).json({msg:"queue not found"});
    const pos=Math.max(0,Math.min(position,q.waiting.length));
    q.waiting.splice(pos,0,appointmentId);
    await q.save();
    res.json({msg:"patient inserted", queue:q.waiting});
    }
    catch(err)
    {
        res.status(500).json({error:err.message});
    }
}
async function reorderQueue(req,res)
{
    try{
    const queueId=req.params.queueId;
    const {newOrder}=req.body;
    const q=await Queue.findById(queueId);
    if(!q)
        return res.status(404).json({msg:"queue not found"});
    q.waiting=newOrder;
    await q.save();
    res.json({msg:"queue reordered"});
    }
    catch(err)
    {
        res.status(500).json({error:err.message});
    }
}
async function pauseQueue(req,res)
{
    try{
    const queueId=req.params.queueId;
    const q=await Queue.findById(queueId);
    if(!q)
        return res.status(404).json({msg:"queue not found"});
    q.status="PAUSED";
    await q.save();
    res.json({msg:"queue paused"});
    }
    catch(err)
    {
        res.status(500).json({error:err.message});
    }
}
async function resumeQueue(req,res)
{
    try{
    const queueId=req.params.queueId;
    const q=await Queue.findById(queueId);
    if(!q)
        return res.status(404).json({msg:"queue not found"});
    q.status="ACTIVE";
    await q.save();
    res.json({msg:"queue resumed"});
    }
   catch(err)
    {
        res.status(500).json({error:err.message});
    }
}
async function getAssignedQueues(req,res)
{
    try{
    const staffId=req.params.staffId;
    const results=await StaffAssignment.find({staffId}).populate("queueId").populate("doctorId","name");
    if(results.length==0)
            return res.status(404).json({err:"not assigned",assign:false});
    res.json({assign:true,queues:results});
}
catch(err)
{
    res.status(500).json({error:err.message});
}
}
async function viewCurrentPatientByqueueId(req,res)
{
    try{
        const queueId=req.params.queueId;
        const queue=await Queue.findById(queueId);
        if(!queue)
                return res.status(404).json({msg:'not found'});
        res.json({currentPatient:q.currentPatient});
}
catch(err)
{
    res.status(500).json({error:err});
}
}
async function viewCurrentPatientBydoctorId(req,res)
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
            const queue=await Queue.findOne({
                doctorId:doctorId,
                createdAt:{
                    $gte:startOfDay,
                    $lt:endOfDay
                }
            });
        if(!queue)
                return res.status(404).json({msg:'not found'});
        res.json({currentPatient:q.currentPatient});
    }
    catch(err)
    {
        res.status(500).json({error:err});
    }
}
module.exports={getQueueIdbyDid,getQueueStatus,getLiveQueue,getAssignedQueues,viewCurrentPatientBydoctorId,viewCurrentPatientByqueueId,resumeQueue,pauseQueue,reorderQueue,insertPatient,verifyPatient};







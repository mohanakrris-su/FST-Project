const Staff=require("../models/staff");
async function addStaff(req,res)
{
      try{
       const {name,staffId,phone,email,password,age,gender,hospitalId,departmentId}=req.body;
           const s=await Staff.findOne({staffId});
           console.log("h1");
           if(s)
               return res.status(404).json({msg:"already exists"});
           const staff=new Staff({name,staffId,phone,email,password,age,gender,hospitalId,departmentId});
        await staff.save();
        console.log("h2");
        res.json({msg:"registered succesfully"});
   }
   catch(err)
   {
       res.status(500).json({error:err.message});
   }
}
async function updateStaff(req,res)
{
     try{
        const staffId=req.params.sid;
       const {name,phone,email,password,age,gender}=req.body;
        const s=await Staff.findOne({staffId});
        if(!s)
               return res.status(404).json({msg:"not exists",found:false});
        await Staff.findOneAndUpdate({staffId},{name,phone,email,password,age,gender});
        res.json({msg:"updated succesfully",found:true});
   }
   catch(err)
   {
       res.status(500).json({error:err});
   }
}
async function deleteStaff(req,res)
{
    try{
        const staffId=req.params.sid;
         const s=await Staff.findOne({staffId});
         if(!s)
                return res.status(404).json({msg:"not exists",found:false});
        await Staff.findOneAndDelete({staffId});  
        res.json({msg:"successfully deleted",found:true});
    }
    catch(err)
    {
        res.status(500).json({error:err});
    }
}
async function getStaffs(req,res){
    try{
    const staffs=await Staff.find();
        res.json({staffs});
    }
    catch(error)
    {
        res.status(500).json({error:error.message});
    }
}
async function getStaffById(req,res){
    try{
    const id=req.params.id;
    const staff=await Staff.findById(id);
    if(!staff)
            return res.status(404).json({found:false,msg:"not found"});
    res.json({staff,found:true});
    }
    catch(error)
    {
        res.status(500).json({error:error.message});
    }
}
module.exports={addStaff,updateStaff,deleteStaff,getStaffById,getStaffs};
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
               return res.status(404).json({msg:"not exists"});
        await Staff.findOneAndUpdate({staffId},{name,phone,email,password,age,gender});
        res.json({msg:"updated succesfully"});
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
                return res.status(404).json({msg:"not exists"});
        await Staff.findOneAndDelete({staffId});  
        res.json({msg:"successfully deleted"});
    }
    catch(err)
    {
        res.status(500).json({error:err});
    }
}
module.exports={addStaff,updateStaff,deleteStaff};
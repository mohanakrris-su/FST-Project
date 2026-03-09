const Doctor=require("../models/Doctor");
async function addDoctor(req,res)
{
      try{
       const {name,id,phone,email,password,age,gender,hospitalId,departmentId}=req.body;
           const d=await Doctor.findOne({id});
           if(d)
               return res.status(404).json({msg:"already exists"});
           const doctor=new Doctor({name,id,phone,email,password,age,gender,hospitalId,departmentId});
        await doctor.save();
        res.json({msg:"registered succesfully"});
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
               return res.status(404).json({msg:"not exists"});
        await Doctor.findOneAndUpdate({id},{name,phone,email,password,age,gender});
        res.json({msg:"updated succesfully"});
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
                return res.status(404).json({msg:"not exists"});
        await Doctor.findOneAndDelete({id});  
        res.json({msg:"successfully deleted"});
    }
    catch(err)
    {
        res.status(500).json({error:err});
    }
}
module.exports={addDoctor,deleteDoctor,updateDoctor};
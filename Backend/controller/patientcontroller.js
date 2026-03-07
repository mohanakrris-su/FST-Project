const Patient=require('../models/patients.js');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const generateTokens = (user) => {
  const payload = { 
    id: user._id // e.g., 'admin', 'doctor'
  };
  const accessToken = jwt.sign(payload, process.env.ACCESS_SECRET, { expiresIn: '10m' });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: '30m' });

  return { accessToken, refreshToken };
};
async function addPatient(req,res){
    try{
        await Patient.create({name:req.body.Name,DOB:req.body.dob,email:req.body.email,phone:req.body.phone,password:req.body.pass});
        res.status(200).json({message:"success"});
    }
    catch(err){
        if(err.code==11000){
           return res.status(400).json({message:"duplicates"})
        }
        if(err.name=="ValidationError"){
           return res.status(400).json({message:"invalid email/phone"})
        }
    }
} 
async function validatepatient(req,res) {
    try{
       let foundpatient= await Patient.findOne({email:req.body.email,password:req.body.pass});
       if(!foundpatient){
            return res.status(400).json({message:"Invalid usermail/password"})
       }
       else{
            const { accessToken, refreshToken } = generateTokens(foundpatient);
            return res.status(200).json({name: foundpatient.name,accessToken,refreshToken});
       }
    }
    catch(err){
        return res.status(400).json({message:err.message});
    }
}


module.exports={addPatient,validatepatient};
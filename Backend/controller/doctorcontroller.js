const Doctor=require('../models/Doctor.js')
async function addDoctors(req,res){
    try{
        Doctor.create({name:req.body.name})
    }
    catch(err){

    }
}
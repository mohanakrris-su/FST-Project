const Department=require('../models/Departments.js')
async function addDepartment(req,res){
    try{
        console.log(req.body.name);
        const newDept=await Department.create({name:req.body.name})
        res.json(newDept)
    }catch(err){
        if(err.code==11000){
            res.json({message:'exists'});
        }
        else{
            res.json({message:'server error'});
        }
    }
}
async function getDepartments(req,res){    
    try{
        const departments=await Department.find();
        res.json(departments)
    }catch(err){
        res.json({message:"server error"})
    }

}
module.exports={addDepartment,getDepartments}
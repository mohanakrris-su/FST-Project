const Department=require("../models/Department");
async function CreateDept(req,res)
{
    try{
    const {hospitalId,name}=req.body;
    const d=await Department.findOne({name});
    if(d)
    {
        res.status(404).json({already:true});
    }
    const dept=await new Department({hospitalId,name});
    await dept.save();
    }
    catch(err)
    {
        res.status(500).json({error:err});
    }
}
async function getDepts(req,res)
{
    try{
        const depts=await Department.find();
        res.json({departments:depts});
    }
    catch(err)
    {
        res.status(500).json({error:err});
    }
}

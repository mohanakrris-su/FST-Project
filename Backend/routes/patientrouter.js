const {addPatient,validatepatient} = require('../controller/patientcontroller');
const { verifyToken } = require('../middlewares/authmiddleware');
const router=require('express').Router();
const Patient=require('../models/patients');
router.post("/signup",addPatient);
router.post("/login",validatepatient);
router.post("/dashboard",verifyToken,(req,res)=>{
    const user=Patient.find({"_id":req.user._id})
    res.json({message:user.name})
})
module.exports=router;
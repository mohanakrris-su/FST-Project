const router=require('express').Router()
const {addDepartment,getDepartments}=require('../controller/departmentcontroller.js');
router.get('/',getDepartments);
router.post('/',addDepartment);
module.exports=router;
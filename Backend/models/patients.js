const mongoose=require('mongoose');
const patientSchema=mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    DOB:{
        type:Date,
        required:true
    },
    email:{
        type:String,
        required:true,
        match:[/^\S+@\S+\.com$/],
        unique:true
    },
    phone:{
        type:String,
        required:true,
        match:[/^\+\d{2}-\d{10}$/],
        unique:true
    },
    password:{
        type:String,
        required:true
    }
},{timestamps:true});
module.exports=mongoose.model('Patient',patientSchema);
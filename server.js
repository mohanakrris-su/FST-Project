const mongoose = require("mongoose");
const express=require("express");
const Patient=require("./models/Patient.js");
const app=express();
const PatientRoutes=require('./routes/patientRoutes.js')
mongoose.connect("mongodb://127.0.0.1:27017/SmartCareQ")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));
app.use("/api/patients",PatientRoutes);
app.get("/add",(req,res)=>{
    const newPatient = new Patient({
    name: "Joseph Dominic",
    phone: "+9198765210",
    email: "joseph@gmail.com",
    password: "mypassword123",
    age: 21,
    gender: "male",
    role: "patient"
});
newPatient.save().then(()=>{console.log("patient save succuessfully")}).catch((err)=>{
    console.log("error",err);
});
res.send("successfully");
});
app.get("/get",(req,res)=>{
    Patient.find()
.then((data) => {
    res.json(data)
;})
.catch((err) => {
    res.json(err);
});
})
app.listen(3000);
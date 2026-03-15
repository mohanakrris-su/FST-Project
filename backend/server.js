const mongoose = require("mongoose");
const express=require("express");
const cors=require("cors");
const jwt=require("jsonwebtoken");
const passport=require("passport");
const Patient=require("./models/Patient.js");
require("dotenv").config();
const cookieParser=require("cookie-parser");
const GoogleStrategy=require("passport-google-oauth20").Strategy;
const app=express();
app.use(passport.initialize());
app.use(cors({
 origin:"http://localhost:5500",
 credentials:true
}));
app.use(cookieParser());
app.use(express.json());
passport.use(new GoogleStrategy({
clientID: process.env.GOOGLE_CLIENT_ID,
clientSecret: process.env.GOOGLE_CLIENT_SECRET,
 callbackURL:"http://localhost:3000/auth/google/callback"
},async (accessToken,refreshToken,profile,done)=>{

 const email=profile.emails?.[0]?.value;
 const user=await Patient.findOne({email});

 if(!user){
   const user=await new Patient({
     password:"########",
     name:profile.displayName,
     email,
     gender:"male",
     age:24,
     phone:"+917708436256"
   });
   console.log(user);
   await user.save();
    return done(null,user);
 }
 return done(null,user);
}));
const route=require('./routes/patientRoutes.js');
const authRouter=require("./routes/authRoutes.js");
const adminRouter=require("./routes/adminRoutes.js");
const doctorRouter=require("./routes/doctorRoutes.js");
const staffRouter=require("./routes/staffRoutes.js");
mongoose.connect("mongodb://127.0.0.1:27017/scq")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));
app.use("/api/patients",route);
app.use("/auth",authRouter);
app.use("/api/admin",adminRouter);
app.use("/api/staff",staffRouter);
app.use("/api/doctor",doctorRouter);
app.listen(3000);
const today = new Date().toISOString().split("T")[0]; 
console.log(today);
module.exports=passport;
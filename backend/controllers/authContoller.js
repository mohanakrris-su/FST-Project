const access_key="leo123";
const refresh_key="doms123";
const passport=require("passport");
const jwt=require("jsonwebtoken");
const staff=require("../models/staff");
const Patient=require("../models/Patient");
const Doctor=require("../models/Doctor");
let refreshTokens=[];

function createAToken(user){
 return jwt.sign(user,access_key,{expiresIn:"1m"});
}

function createRToken(user){
 const token=jwt.sign(user,refresh_key,{expiresIn:"1d"});
 refreshTokens.push(token);
 return token;
}

async function loginP(req,res){
 const {email,password}=req.body;
 const u=await Patient.findOne({email});
 if(!u) return res.status(401).json({msg:"invalid"});
 if(u.password!=password){
  return res.status(404).json({msg:"password incorrect"});
 }
 const payload={role:"patient",email:u.email};
 const at=createAToken(payload);
 const rt=createRToken(payload);
 res.cookie("refreshToken",rt,{httpOnly:true,sameSite:"strict",secure:false});
 res.json({accessToken:at});
}

async function loginS(req,res){
 const {staffId,password}=req.body;
 const u=await staff.findOne({staffId});
 if(!u) return res.status(401).json({msg:"invalid"});
 if(u.password!=password){
  return res.status(404).json({msg:"password incorrect"});
 }
 const payload={role:"staff",staffId};
 const at=createAToken(payload);
 const rt=createRToken(payload);
 res.cookie("refreshToken",rt,{httpOnly:true,sameSite:"strict",secure:false});
 res.json({accessToken:at});
}

async function loginD(req,res){
 const {doctorId,password}=req.body;
 const u=await Doctor.findOne({doctorId});
 if(!u) return res.status(401).json({msg:"invalid"});
 if(u.password!=password){
  return res.status(404).json({msg:"password incorrect"});
 }
 const payload={role:"doctor",doctorId};
 const at=createAToken(payload);
 const rt=createRToken(payload);
 res.cookie("refreshToken",rt,{httpOnly:true,sameSite:"strict",secure:false});
 res.json({accessToken:at});
}

function google(req,res,next){
 passport.authenticate("google",{scope:["profile","email"]})(req,res,next);
}

function callback(req,res){
 const payload={email:req.user.email,role:"patient"};
 const at=createAToken(payload);
 const rt=createRToken(payload);
 res.cookie("refreshToken",rt,{httpOnly:true,sameSite:"strict",secure:false});
 res.json({accessToken:at});
}

function refreshP(req,res){
 const token=req.cookies.refreshToken;
 if(!token) return res.status(401).json({msg:"logout"});
 if(!refreshTokens.includes(token)) return res.status(403).json({msg:"logout"});
 jwt.verify(token,refresh_key,(err,user)=>{
  if(err) return res.status(403).json({msg:"logout"});
  const payload={email:user.email,role:user.role};
  const at=createAToken(payload);
  res.json({accessToken:at});
 });
}

function refreshS(req,res){
 const token=req.cookies.refreshToken;
 if(!token) return res.status(401).json({msg:"logout"});
 if(!refreshTokens.includes(token)) return res.status(403).json({msg:"logout"});
 jwt.verify(token,refresh_key,(err,user)=>{
  if(err) return res.status(403).json({msg:"logout"});
  const payload={staffId:user.staffId,role:user.role};
  const at=createAToken(payload);
  res.json({accessToken:at});
 });
}

function refreshD(req,res){
 const token=req.cookies.refreshToken;
 if(!token) return res.status(401).json({msg:"logout"});
 if(!refreshTokens.includes(token)) return res.status(403).json({msg:"logout"});
 jwt.verify(token,refresh_key,(err,user)=>{
  if(err) return res.status(403).json({msg:"logout"});
  const payload={doctorId:user.doctorId,role:user.role};
  const at=createAToken(payload);
  res.json({accessToken:at});
 });
}

function logout(req,res){
 const token=req.cookies.refreshToken;
 refreshTokens=refreshTokens.filter(t=>t!==token);
 res.clearCookie("refreshToken",{httpOnly:true,secure:false,sameSite:"strict"});
 res.json({msg:"logged out"});
}

module.exports={refreshP,google,callback,logout,loginP,loginS,loginD,refreshD,refreshS};
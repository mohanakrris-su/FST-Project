const access_key="leo123";
const refresh_key="doms123";
const passport=require("passport");
const jwt = require("jsonwebtoken");
let refreshTokens=[];
function createAToken(user){
 return jwt.sign(user,access_key,{expiresIn:"1m"});
}
function createRToken(user){
 const token=jwt.sign(user,refresh_key,{expiresIn:"1d"});
 refreshTokens.push(token);
 return token;
}
async function login (req,res) {
 const {email,password}=req.body;

 const u=await Patient.findOne({email});
 if(!u) return res.status(401).json({msg:"invalid"});
if(u.password!=password)
{
    return res.status(404).json({msg:"password incorrect"});
}
 const payload={role:"patient",email:u.email};

 const at=createAToken(payload);
 const rt=createRToken(payload);

 res.cookie("refreshToken",rt,{httpOnly:true,sameSite:"strict",secure:false});

 res.json({accessToken:at});
}


function google(req, res, next) {
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
}
 function callback(req,res){

   const payload={name:req.user.email,role:"patient"};

   const at=createAToken(payload);
   const rt=createRToken(payload);
   console.log(at,rt);

   res.cookie("refreshToken",rt,{httpOnly:true,sameSite:"strict",secure:false});
   res.json({accessToken:at});
}
function refresh(req,res){
 const token=req.cookies.refreshToken;
console.log("hello",token,"leo");
 if(!token) return res.status(401).json({msg:"logout"});
 if(!refreshTokens.includes(token)) return res.status(403).json({msg:"logout"});

jwt.verify(token,refresh_key,(err,user)=>{
   if(err) return res.status(403).json({msg:"logout"});

   const payload = {
      email:user.email,
      role:"patient"
   };

   const at = createAToken(payload);
   console.log("hello");
   res.json({accessToken:at});
});
}
function logout(req,res){
res.clearCookie("refreshToken", {
 httpOnly: true,
 secure: false,
 sameSite: "strict"
});
 res.json({msg:"logged out"});
};

module.exports={refresh,google,callback,logout,login};
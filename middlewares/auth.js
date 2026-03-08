const access_key="leo123";
const refresh_key="doms123";
function auth(req,res,next){
 const h=req.headers.authorization;
 if(!h) return res.sendStatus(401);

 const token=h.split(" ")[1];

 jwt.verify(token,access_key,(err,user)=>{
   if(err) return res.sendStatus(401);
   req.user=user;
   next();
 });
};
module.exports=auth;
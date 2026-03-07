const jwt=require("jsonwebtoken");
function verifyToken(req,res,next){
    const token=req.headers['authorization']?.split(' ')[1]
    if(!token){
        return res.status(400).json({message:"access denied"})

    }
    try{
        const verified=jwt.verify(token,process.env.ACCESS_SECRET);
        req.user=verified;
        next();
    }catch(err){
        return res.status(400).json({message:"Invalid or expired"})
    }
}
module.exports={verifyToken};
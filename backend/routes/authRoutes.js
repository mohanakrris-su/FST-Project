const {google,callback,logout,loginP, refreshP, loginS, loginD, refreshD, refreshS}=require("../controllers/authContoller");
const passport=require("passport");
const router=require("express").Router();
router.get("/google/callback",
passport.authenticate("google",{session:false}),callback);
router.post("/login/Patient",loginP);
router.post("/refresh/Patient",refreshP);
router.post("/login/Staff",loginS);
router.post("/refresh/Staff",refreshS);
router.post("/login/Doctor",loginD);
router.post("/refresh/Doctor",refreshD);
router.post("/logout",logout);
router.get("/google",google);
module.exports=router;
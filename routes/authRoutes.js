const {refresh,google,callback,logout,login}=require("../controllers/authContoller");
const passport=require("passport");
const router=require("express").Router();
router.get("/google/callback",
passport.authenticate("google",{session:false}),callback);
router.post("/login",login);
router.post("/refresh",refresh);
router.post("/logout",logout);
router.get("/google",google);
module.exports=router;
const mongoose=require('mongoose')
require('dotenv').config();
const uri=process.env.MONGO_URI;
async function connectDB(){
    try{
     const conn=  await mongoose.connect(uri);
        console.log("Successful connection ",conn.connection.host);
    }
    catch(err){
        console.log(err);
    }
}
module.exports= {connectDB};
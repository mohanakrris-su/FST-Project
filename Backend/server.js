const express=require('express');

//const {MongoClient,ObjectId}=require('mongodb');
const cors=require('cors')
const app=express();
const {connectDB} =require('./config/db.js')
const doctorRoutes=require('./routes/departmentrouter.js')
const patientroutes=require('./routes/patientrouter.js')
app.use(cors());
app.use(express.json());
connectDB();
app.use('/api/departments',doctorRoutes);
app.use('/api/patients',patientroutes);
app.listen(3000,()=>{
    console.log('server started')
})

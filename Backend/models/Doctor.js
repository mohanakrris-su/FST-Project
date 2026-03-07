const mongoose=require('mongoose');
const Departments = require('./Departments');
const doctorSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    doctorid:{
        type:String,
        required:true,
        unique:true
    },
    departmentid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Department'
    }
    ,
    status:{
        type:String,
        enum: ['AVAILABLE', 'IN_ROOM', 'OFFLINE', 'BREAK'],
        default:'OFFLINE'

    },
    dailyCapacity:{
        type:Number,
        default:30
    }
},{
    timestamps:true
})
module.exports=mongoose.model('Doctor',doctorSchema);
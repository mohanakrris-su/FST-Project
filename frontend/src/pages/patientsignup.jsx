import axios from "axios";
import { useState } from "react";

function PatientSignup(){
    let [Name,setName]=useState("");
    let [dob,setDOB]=useState("");
    let [email,setmail]=useState("");
    let [phone,setphone]=useState("");
    let [pass,setpass]=useState("");
    async function postdata(){
        try{
            let details={Name,dob,email,phone,pass};
            const res=await axios.post("http://localhost:3000/api/patients/signup",details);
            alert(res.data.message);
        }
        catch(err){
            const backenderr=err.response?.data?.message;
            alert(backenderr)
        }

    }
    function addPatient(e){
        e.preventDefault();
        postdata();
    }
    return (
        <form action="" onSubmit={addPatient}>
            <label >patient name <input type="text" onChange={(e)=>{setName(e.target.value)}}/></label><br />
            <label >Date Of Birth <input type="date" onChange={(e)=>{setDOB(e.target.value)}}/></label><br />
            <label >Email:<input type="text" pattern="^\S+@\S+\.com$" onChange={(e)=>{setmail(e.target.value)}}/></label><br />
            <label >Phone: <input type="text" placeholder="+XX-XXXXXXXXXX" pattern="\+\d{2}-\d{10}" onChange={(e)=>{setphone(e.target.value)}}/></label><br />
            <label >password:<input type="password" onChange={(e)=>{setpass(e.target.value)}}/></label>
            <button type="submit">Register</button>
        </form>
    )
}

export default PatientSignup;
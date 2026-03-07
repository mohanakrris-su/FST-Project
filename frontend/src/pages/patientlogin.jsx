import axios from "axios";
import { useState } from "react";
import {Link, useNavigate} from 'react-router-dom'
function PatientLogin(){
    let navigate=useNavigate();
    let [email,setmail]=useState("");
    let [pass,setpass]=useState("")
    async function validatedata(){
        try{
            let data={email,pass};
            let res=await axios.post("http://localhost:3000/api/patients/login",data);
            localStorage.setItem("token", res.data.accessToken); 
            localStorage.setItem("patientName", res.data.name);
            alert("hello");
            navigate("/dashboard",{state:{userData:res.data.accessToken}});  
        }
        catch(err){
            let backenderr=err.response?.data?.message;
            alert(backenderr)
        }
    }
    function Login(e){
        e.preventDefault();
        validatedata();
    }
    return(
        <>
            <form onSubmit={Login}>
                <label>user mail:<input type="text" pattern="^\S+@\S+\.com$" onChange={(e)=>{setmail(e.target.value)}}/></label><br />
                <label>password:<input type="password" onChange={(e)=>{setpass(e.target.value)}}/></label>
                <button type="submit">login</button>
            </form>
            <nav><Link to="/signup">signup</Link></nav>
        </>
    )
}
export default PatientLogin;
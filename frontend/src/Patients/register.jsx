import { useState } from "react";
import axios from "axios"
function Signup(){
    let [pname,setName]=useState("")
    let [page,setAge]=useState("")
    let [pnumber,setNumber]=useState("")
    let [pemail,setEmail]=useState("")
    let [pgender,setGender]=useState(0)
    let [ppassword,setPassword]=useState("")
    function Register(e){
        e.preventDefault();
        let PatientData={pname,page,pemail,ppassword,pnumber,pgender};
        //axios.post("/api/patients/")
    }
    return(
        <>
            <form action="">
                <label>name:<input type="text" required onChange={(e)=>{setName(e.target.value)}}/></label><br />
                <label>age:<input type="number" required onChange={(e)=>{setAge(e.target.value)}}/></label><br />
                <label>gender: 
                    <select name="gender" id="" onChange={(e)=>{setGender(e.target.value)}}>
                        <option value="" defaultChecked hidden>select</option>
                        <option value="male">male</option>
                        <option value="female">female</option>
                        <option value="other">other</option>
                    </select>
                </label><br />
                <label>email:<input type="email" required onChange={(e)=>{setEmail(e.target.value)}}/></label><br />
                <label>phone:<input type="text" pattern="^\+\d{2}-\d{10}$" required onChange={(e)=>{setNumber(e.target.value)}}/></label><br />
                <label>enter password:<input type="password" required onChange={(e)=>{setPassword(e.target.value)}}/></label><br />
                <label>confirm password:<input type="password" required/></label>              
                <button onSubmit={Register} type="submit">Register</button>
            </form>
        </>
    )
}
export default Signup;
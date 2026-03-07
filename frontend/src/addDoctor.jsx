import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import styles from './fromstyle.module.css'
function Adddoctor(){
    let [selecteddepartment,setDepartment]=useState("")
    let [departments,setdepartments]=useState([]);
    async function fecthdepartments(){
        let res=await axios.get("http://localhost:3000/api/departments")
        setdepartments(res.data);
    }
    useEffect(()=>{
        fecthdepartments();
    },[])
    function addDoctor(e){
        e.preventDefault();
        console.log(selecteddepartment);
    }
    return(
        <form action="" onSubmit={addDoctor} className={styles.forms}>
            <label htmlFor="">Doctorid      {""}<input type="text" name="" id="" /></label>
            <label htmlFor="">Doctorname<input type="text" name="" id="" /></label>
            <label htmlFor="">department
            <select name="department" id="" onChange={(e)=>{setDepartment(e.target.value)}}>
                {
                    departments.map((department)=><option key={department._id} value={department._id} name="department">{department.name}</option>)
                }
            </select>
            </label>
            <button type="submit">add</button>
        </form>
    )
}
export default Adddoctor;
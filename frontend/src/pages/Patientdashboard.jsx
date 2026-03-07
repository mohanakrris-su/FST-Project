import { useLocation } from "react-router-dom";

function Patientdashboard(){
    let loc=useLocation();
    let username=loc.state?.userData;
    return(
        <>
            hello :{username}
        </>
    )
}
export default Patientdashboard;
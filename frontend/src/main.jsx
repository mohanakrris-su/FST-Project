import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
//import './index.css'
import {BrowserRouter,Routes,Route} from 'react-router-dom' 
import Adddoctor from './addDoctor.jsx'
import PatientSignup from './pages/patientsignup.jsx'
import PatientLogin from './pages/patientlogin.jsx'
import Patientdashboard from './pages/Patientdashboard.jsx'
createRoot(document.getElementById('root')).render(
   <>
   <BrowserRouter>
      <Routes>
         <Route path='/login' element={<PatientLogin/>}></Route>
         <Route path='/signup' element={<PatientSignup/>}></Route>
         <Route path='/dashboard' element={<Patientdashboard/>}></Route>
      </Routes>
   </BrowserRouter>
   </>
   
)

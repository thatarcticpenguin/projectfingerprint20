import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./LoginPage";
import PatientForm from "./PatientForm";
import MapView from "./MapView";
import HospitalDashboard from "./hospitaldash";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/form" element={<PatientForm />} />
        <Route path="/mappreview" element={<MapView />} />
        <Route path="/hdash" element={<HospitalDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
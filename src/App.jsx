import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import PatientForm from "./PatientForm";
import LoginPage from "./LoginPage";
import RegistrationPage from "./RegisterPage"
import MapView from "./MapView";
import Navtabs from "./navtabs";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<RegistrationPage />} />
        <Route path="/form" element={<PatientForm />} />
        <Route path="/hdash" element={<Navtabs />} />
        <Route path="/map" element={<MapView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

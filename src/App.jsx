import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import PatientForm from "./PatientForm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form" element={<PatientForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

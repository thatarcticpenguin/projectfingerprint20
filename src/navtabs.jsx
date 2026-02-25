import { useState } from "react";
import HospitalDashboard from "./hospitaldashboard";
import PatientDashboard from "./PatientDashboard";
import "./navtabs.css";

export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("hospital");

  
  const adminHospital = JSON.parse(sessionStorage.getItem("adminHospital") || "null");

  return (
    <div className="dashboard-tabs-wrapper">
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === "hospital" ? "active" : ""}`}
          onClick={() => setActiveTab("hospital")}
        >
          🏥 Hospital Control
        </button>
        <button
          className={`tab-btn ${activeTab === "patients" ? "active" : ""}`}
          onClick={() => setActiveTab("patients")}
        >
          🚨 Incoming Patients
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "hospital" && (
          <HospitalDashboard adminHospital={adminHospital} />
        )}
        {activeTab === "patients" && (
          <PatientDashboard adminHospital={adminHospital} />
        )}
      </div>
    </div>
  );
}
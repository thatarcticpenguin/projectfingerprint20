import { useEffect, useState, useRef } from "react";
import { db } from "./firebase";
import { ref, onValue } from "firebase/database";
import "./PatientDashboard.css";

export default function PatientDashboard({ adminHospital }) {
  const [patients, setPatients] = useState([]);
  const previousCount = useRef(0);

  useEffect(() => {
    if (!adminHospital?.firebaseKey) return;

    
    const patientsRef = ref(db, `hospitals/${adminHospital.firebaseKey}/patients`);

    const unsubscribe = onValue(patientsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data)
          .map(([id, value]) => ({ id, ...value }))
          .sort((a, b) => (b.timestamp_ms ?? 0) - (a.timestamp_ms ?? 0)); 

        setPatients(list);

        
        if (list.length > previousCount.current) {
          const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
          audio.play().catch(() => {});
        }
        previousCount.current = list.length;
      } else {
        setPatients([]);
        previousCount.current = 0;
      }
    });

    return () => unsubscribe();
  }, [adminHospital?.firebaseKey]);

  if (!adminHospital) {
    return (
      <div className="patient-dashboard-wrapper">
        <div className="patient-dashboard-card">
          <p style={{ color: "#ef4444", textAlign: "center" }}>
            ⚠ No hospital linked. Please log in as a Hospital Admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-dashboard-wrapper">
      <div className="patient-dashboard-card">
        <h2 className="dashboard-title">🚨 Incoming Patients — {adminHospital.name}</h2>
        <div className="table-wrapper">
          <table className="patient-table">
            <thead>
              <tr>
                <th>Dept</th>
                <th>Condition</th>
                <th>Severity</th>
                <th>Location</th>
                <th>Status</th>
                <th>Golden Hour</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    No incoming emergencies 🚑
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <PatientRow key={patient.id} patient={patient} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PatientRow({ patient }) {
  const severityColor = {
    critical: "#fee2e2",
    moderate: "#fef9c3",
    stable:   "#dcfce7",
  }[patient.severity] ?? "transparent";

  const severityLabel = {
    critical: "🔴 Critical",
    moderate: "🟡 Moderate",
    stable:   "🟢 Stable",
  }[patient.severity] ?? patient.severity;

  const timeStr = patient.timestamp
    ? new Date(patient.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";

  const deptLabel = patient.dept
    ? patient.dept.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "—";

  return (
    <tr style={{ background: severityColor }}>
      <td>{deptLabel}</td>
      <td>{patient.disease ?? "—"}</td>
      <td>{severityLabel}</td>
      <td>{typeof patient.location === "object"
        ? `${patient.location.lat?.toFixed(4)}, ${patient.location.lng?.toFixed(4)}`
        : patient.location ?? "—"}
      </td>
      <td>{patient.status ?? "Incoming"}</td>
      <td style={{ textAlign: "center" }}>{patient.isGoldenHour ? "⚡ Yes" : "—"}</td>
      <td>{timeStr}</td>
    </tr>
  );
}
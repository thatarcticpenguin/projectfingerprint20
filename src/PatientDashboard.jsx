import { useEffect, useState, useRef } from "react";
import { db } from "./firebase";
import { ref, onValue } from "firebase/database";
import "./PatientDashboard.css";

export default function PatientDashboard({ hospitalId }) {
  const [patients, setPatients] = useState([]);
  const previousCount = useRef(0);

  useEffect(() => {
    const patientsRef = ref(db, "patients");

    const unsubscribe = onValue(patientsRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const filteredPatients = Object.entries(data)
          .map(([id, value]) => ({ id, ...value }))
          .filter((patient) => patient.hospitalId === hospitalId);

        setPatients(filteredPatients);

        // 🔔 Alert sound for new patient
        if (filteredPatients.length > previousCount.current) {
          const audio = new Audio(
            "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
          );
          audio.play();
        }

        previousCount.current = filteredPatients.length;
      } else {
        setPatients([]);
      }
    });

    return () => unsubscribe();
  }, [hospitalId]);

  return (
  <div className="patient-dashboard-wrapper">
    <div className="patient-dashboard-card">
      <h2 className="dashboard-title">🚨 Emergency Incoming Patients</h2>

      <div className="table-wrapper">
        <table className="patient-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Condition</th>
              <th>Distance</th>
              <th>ETA</th>
              <th>Status</th>
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
  const [eta, setEta] = useState(patient.eta || 600);

  useEffect(() => {
    const interval = setInterval(() => {
      setEta((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const rowClass =
    patient.condition?.toLowerCase() === "critical"
      ? "critical-row"
      : "normal-row";

  return (
    <tr className={rowClass}>
      <td>{patient.name}</td>
      <td>{patient.age}</td>
      <td>{patient.gender}</td>
      <td>{patient.condition}</td>
      <td>{patient.distance}</td>
      <td>{formatTime(eta)}</td>
      <td>{patient.status || "En Route"}</td>
    </tr>
  );
}
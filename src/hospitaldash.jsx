import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "./firebase";

// 🔧 CHANGE THIS per hospital login
const HOSPITAL_KEY = "hospital1";

export default function HospitalDashboard() {
  const [cases, setCases] = useState([]);

  useEffect(() => {
    const casesRef = ref(db, `/hospitals/${HOSPITAL_KEY}/0/cases`);

    onValue(casesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setCases([]);
        return;
      }

      const formatted = Object.entries(data).map(([id, c]) => ({
        id,
        ...c
      }));

      // newest first
      formatted.sort((a, b) => b.sent_at_ms - a.sent_at_ms);

      setCases(formatted);
    });
  }, []);

  // ⏱ sent ago formatter
  function sentAgo(ms) {
    const sec = Math.floor((Date.now() - ms) / 1000);
    if (sec < 60) return "Just now";
    if (sec < 3600) return `${Math.floor(sec / 60)} mins ago`;
    return `${Math.floor(sec / 3600)} hrs ago`;
  }

  function updateStatus(caseId, status) {
    update(
      ref(db, `/hospitals/${HOSPITAL_KEY}/0/cases/${caseId}`),
      { status }
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px",
        background: "#f1f5f9"
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>
        🏥 Hospital Emergency Dashboard
      </h2>

      {cases.length === 0 && (
        <p>No active emergency cases.</p>
      )}

      {cases.map((c) => (
        <div
          key={c.id}
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "15px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.1)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>
              🚑 {c.patient.disease}
            </strong>
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              {sentAgo(c.sent_at_ms)}
            </span>
          </div>

          <p style={{ marginTop: "8px" }}>
            <b>Department:</b> {c.patient.department}<br />
            <b>Severity:</b>{" "}
            <span
              style={{
                color:
                  c.patient.severity === "critical"
                    ? "red"
                    : c.patient.severity === "moderate"
                    ? "orange"
                    : "green",
                fontWeight: "bold"
              }}
            >
              {c.patient.severity.toUpperCase()}
            </span>
            <br />
            <b>Location:</b> {c.patient.location}
          </p>

          <p>
            <b>Paramedic:</b> {c.paramedic_email}
          </p>

          <p>
            <b>Status:</b>{" "}
            <span style={{ fontWeight: "bold" }}>
              {c.status.toUpperCase()}
            </span>
          </p>

          <div style={{ display: "flex", gap: "10px" }}>
            {c.status === "sent" && (
              <button
                onClick={() => updateStatus(c.id, "accepted")}
                style={{
                  padding: "10px",
                  background: "#16a34a",
                  color: "white",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Accept Case
              </button>
            )}

            {c.status === "accepted" && (
              <button
                onClick={() => updateStatus(c.id, "completed")}
                style={{
                  padding: "10px",
                  background: "#0f172a",
                  color: "white",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Mark Completed
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
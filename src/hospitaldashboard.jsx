import { useState, useEffect } from "react";
import "./hospitaldashboard.css";
import { ref, update, onValue } from "firebase/database";
import { db } from "./firebase";

const DEPARTMENTS = [
  { id: "general_medicine", label: "General Medicine",  dbKey: "general"        },
  { id: "cardiology",       label: "Cardiology",         dbKey: "cardiac"        },
  { id: "neurology",        label: "Neurology",          dbKey: "neurology"      },
  { id: "orthopedics",      label: "Orthopedics",        dbKey: "orthopedic"     },
  { id: "pulmonology",      label: "Pulmonology",        dbKey: "pulmonology"    },
  { id: "nephrology",       label: "Nephrology",         dbKey: "nephrology"     },
  { id: "urology",          label: "Urology",            dbKey: "urology"        },
  { id: "dermatology",      label: "Dermatology",        dbKey: "dermatology"    },
  { id: "pediatrics",       label: "Pediatrics",         dbKey: "pediatrics"     },
  { id: "gynecology",       label: "Gynecology",         dbKey: "gynecology"     },
  { id: "ent",              label: "ENT",                dbKey: "ent"            },
  { id: "ophthalmology",    label: "Ophthalmology",      dbKey: "ophthalmology"  },
  { id: "psychiatry",       label: "Psychiatry",         dbKey: "psychiatry"     },
  { id: "oncology",         label: "Oncology",           dbKey: "oncology"       },
  { id: "radiology",        label: "Radiology",          dbKey: "radiology"      },
  { id: "anesthesiology",   label: "Anesthesiology",     dbKey: "anesthesiology" },
];

const emptySpecialists = () =>
  DEPARTMENTS.reduce((acc, d) => { acc[d.id] = ""; return acc; }, {});

export default function HospitalDashboard({ adminHospital }) {
  const [formData, setFormData] = useState({
    availableBeds: "",
    icuBeds: "",
    status: "Ready",
    specialists: emptySpecialists(),
  });
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  
  useEffect(() => {
    if (!adminHospital?.firebaseKey) return;

    const hospitalRef = ref(db, `/hospitals/${adminHospital.firebaseKey}`);
    const unsub = onValue(hospitalRef, (snapshot) => {
      const h = snapshot.val();
      if (!h) return;

      const specialistsFromDb = h.availability?.specialists || {};
      const specialistsState = emptySpecialists();
      DEPARTMENTS.forEach((d) => {
        specialistsState[d.id] = specialistsFromDb[d.dbKey] ?? "";
      });

      setFormData({
        availableBeds: h.availability?.beds ?? "",
        icuBeds:       h.availability?.icu_beds ?? "",
        status:        h.status ?? "Ready",
        specialists:   specialistsState,
      });
    });

    return () => unsub();
  }, [adminHospital?.firebaseKey]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSpecialistChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      specialists: { ...prev.specialists, [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminHospital?.firebaseKey) { alert("No hospital linked to this account."); return; }

    setSaving(true);
    setSavedMsg("");

    const hospitalRef = ref(db, `/hospitals/${adminHospital.firebaseKey}`);
    const updates = {
      "availability/beds":     Number(formData.availableBeds),
      "availability/icu_beds": Number(formData.icuBeds),
      status:                  formData.status,
      last_updated:            new Date().toISOString(),
      last_updated_ms:         Date.now(),
    };

    DEPARTMENTS.forEach((d) => {
      updates[`availability/specialists/${d.dbKey}`] = Number(formData.specialists[d.id] || 0);
    });

    await update(hospitalRef, updates);
    setSaving(false);
    setSavedMsg("✅ Hospital data updated successfully!");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  if (!adminHospital) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-card">
          <p style={{ color: "#ef4444", textAlign: "center" }}>
            ⚠ No hospital linked. Please log in as a Hospital Admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2>🏥 {adminHospital.name}</h2>

        <form onSubmit={handleSubmit}>
          {}
          <div className="grid-2">
            <div className="form-group">
              <label>Available Beds</label>
              <input
                type="number" name="availableBeds" min="0"
                value={formData.availableBeds} onChange={handleChange} required
              />
            </div>
            <div className="form-group">
              <label>ICU Beds</label>
              <input
                type="number" name="icuBeds" min="0"
                value={formData.icuBeds} onChange={handleChange} required
              />
            </div>
          </div>

          {}
          <div className="form-group">
            <label>Hospital Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="Ready">🟢 Ready</option>
              <option value="Busy">🟡 Busy</option>
              <option value="Full">🔴 Full</option>
            </select>
          </div>

          {}
          <h4 style={{ marginTop: "24px", marginBottom: "16px" }}>
            Specialists Availability
          </h4>
          <div className="grid-3">
            {DEPARTMENTS.map((d) => (
              <div key={d.id} className="form-group" style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px", display: "block" }}>
                  {d.label}
                </label>
                <input
                  type="number" name={d.id} min="0"
                  value={formData.specialists[d.id]}
                  onChange={handleSpecialistChange}
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>
            ))}
          </div>

          {savedMsg && (
            <div style={{ background: "#dcfce7", color: "#166534", border: "1px solid #86efac",
              borderRadius: "8px", padding: "10px 14px", marginBottom: "12px", fontSize: "14px" }}>
              {savedMsg}
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={saving}>
            {saving ? "Saving…" : "Update Hospital Status"}
          </button>
        </form>
      </div>
    </div>
  );
}
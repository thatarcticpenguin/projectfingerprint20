import { useState, useEffect } from "react";
import "./hospitaldashboard.css";
import { ref, update, get, onValue } from "firebase/database";
import { db } from "./firebase";

const DEPARTMENTS = [
  { id: "general_medicine", label: "General Medicine", dbKey: "general" },
  { id: "cardiology", label: "Cardiology", dbKey: "cardiac" },
  { id: "neurology", label: "Neurology", dbKey: "neurology" },
  { id: "orthopedics", label: "Orthopedics", dbKey: "orthopedic" },
  { id: "pulmonology", label: "Pulmonology", dbKey: "pulmonology" },
  { id: "nephrology", label: "Nephrology", dbKey: "nephrology" },
  { id: "urology", label: "Urology", dbKey: "urology" },
  { id: "dermatology", label: "Dermatology", dbKey: "dermatology" },
  { id: "pediatrics", label: "Pediatrics", dbKey: "pediatrics" },
  { id: "gynecology", label: "Gynecology", dbKey: "gynecology" },
  { id: "ent", label: "ENT", dbKey: "ent" },
  { id: "ophthalmology", label: "Ophthalmology", dbKey: "ophthalmology" },
  { id: "psychiatry", label: "Psychiatry", dbKey: "psychiatry" },
  { id: "oncology", label: "Oncology", dbKey: "oncology" },
  { id: "radiology", label: "Radiology", dbKey: "radiology" },
  { id: "anesthesiology", label: "Anesthesiology", dbKey: "anesthesiology" }
];

export default function HospitalDashboard() {
  const [formData, setFormData] = useState({
    hospital: "",
    availableBeds: "",
    icuBeds: "",
    status: "Ready",
    specialists: DEPARTMENTS.reduce((acc, d) => {
      acc[d.id] = "";
      return acc;
    }, {})
  });

  const [hospitalsSnapshot, setHospitalsSnapshot] = useState(null);
  const [hospitalOptions, setHospitalOptions] = useState([]);

  useEffect(() => {
    const hospitalsRef = ref(db, "/hospitals");
    const unsubscribe = onValue(hospitalsRef, (snapshot) => {
      const raw = snapshot.val() || {};
      setHospitalsSnapshot(raw);

      const opts = Object.entries(raw)
        .map(([key, arr]) => {
          const hospital = Array.isArray(arr) ? arr[0] : null;
          if (!hospital || !hospital.hospital_name) return null;
          return { key, label: hospital.hospital_name };
        })
        .filter(Boolean);

      setHospitalOptions(opts);
    });
    return () => unsubscribe();
  }, []);

  const applyHospitalDataToForm = (hospitalKey, hospitalName, rootData) => {
    const hospitalArr = rootData?.[hospitalKey];
    const data = Array.isArray(hospitalArr) ? hospitalArr[0] : null;
    if (!data) return;

    setFormData((prev) => {
      const specialistsFromDb = data?.availability?.specialists || {};
      const specialistsState = { ...prev.specialists };

      DEPARTMENTS.forEach((d) => {
        specialistsState[d.id] = specialistsFromDb[d.dbKey] ?? "";
      });

      return {
        ...prev,
        hospital: hospitalName,
        availableBeds: data?.availability?.beds ?? "",
        icuBeds: data?.availability?.icu_beds ?? "",
        status: data?.status ?? "Ready",
        specialists: specialistsState
      };
    });
  };

  const fetchHospitalData = async (hospitalKey, hospitalName) => {
    if (hospitalsSnapshot) {
      applyHospitalDataToForm(hospitalKey, hospitalName, hospitalsSnapshot);
      return;
    }

    const hospitalRef = ref(db, `/hospitals/${hospitalKey}/0`);
    const snapshot = await get(hospitalRef);
    if (snapshot.exists()) {
      const single = snapshot.val();
      applyHospitalDataToForm(hospitalKey, hospitalName, {
        [hospitalKey]: [single]
      });
    }
  };

  const handleHospitalChange = async (e) => {
    const hospitalName = e.target.value;
    const hospitalEntry = hospitalOptions.find((h) => h.label === hospitalName);
    const hospitalKey = hospitalEntry?.key;

    setFormData((prev) => ({
      ...prev,
      hospital: hospitalName
    }));

    if (hospitalKey) {
      await fetchHospitalData(hospitalKey, hospitalName);
    }
  };

  const handleHospitalKeyDown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await handleHospitalChange(e);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSpecialistChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      specialists: {
        ...prev.specialists,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hospitalEntry = hospitalOptions.find(
      (h) => h.label === formData.hospital
    );
    const hospitalKey = hospitalEntry?.key;
    if (!hospitalKey) {
      alert("Invalid hospital selected");
      return;
    }

    const hospitalRef = ref(db, `/hospitals/${hospitalKey}/0`);

    const updates = {
      "availability/beds": Number(formData.availableBeds),
      "availability/icu_beds": Number(formData.icuBeds),
      status: formData.status,
      last_updated: new Date().toISOString(),
      last_updated_ms: Date.now()
    };

    DEPARTMENTS.forEach((d) => {
      const value = Number(formData.specialists[d.id] || 0);
      updates[`availability/specialists/${d.dbKey}`] = value;
    });

    await update(hospitalRef, updates);

    alert("Hospital Data Updated Successfully 🚑");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2>🏥 Hospital Control Panel</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Hospital</label>
            <input
              list="hospital-list"
              name="hospital"
              value={formData.hospital}
              onChange={handleHospitalChange}
              onKeyDown={handleHospitalKeyDown}
              autoComplete="off"
              placeholder="Search and select hospital..."
              required
            />
            <datalist id="hospital-list">
              {hospitalOptions.map((h) => (
                <option key={h.key} value={h.label} />
              ))}
            </datalist>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Available Beds</label>
              <input
                type="number"
                name="availableBeds"
                value={formData.availableBeds}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>ICU Beds</label>
              <input
                type="number"
                name="icuBeds"
                value={formData.icuBeds}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <h4>Specialists Availability</h4>

          <div className="grid-3">
            {DEPARTMENTS.map((d) => (
              <input
                key={d.id}
                type="number"
                name={d.id}
                placeholder={d.label}
                value={formData.specialists[d.id]}
                onChange={handleSpecialistChange}
              />
            ))}
          </div>

          <button type="submit" className="submit-btn">
            Update Hospital Status
          </button>
        </form>
      </div>
    </div>
  );
}
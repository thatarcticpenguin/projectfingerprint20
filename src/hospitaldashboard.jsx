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
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredHospitals, setFilteredHospitals] = useState([]);

  useEffect(() => {
    console.log("📱 HospitalDashboard component mounted");
    console.log("🔗 DB instance:", db);
    
    const hospitalsRef = ref(db, "/hospitals");
    console.log("📍 Reading from path: /hospitals");
    
    const unsubscribe = onValue(
      hospitalsRef,
      (snapshot) => {
        const raw = snapshot.val();
        console.log("✅ Firebase snapshot received, exists:", snapshot.exists());
        console.log("🔥 Firebase data received:", raw);
        
        if (!raw) {
          console.warn("⚠️ No data returned from Firebase");
          setHospitalOptions([]);
          return;
        }
        
        setHospitalsSnapshot(raw);

        const opts = Object.entries(raw)
          .map(([key, hospital]) => {
            console.log(`  - Processing ${key}:`, hospital?.hospital_name);
            if (!hospital || !hospital.hospital_name) {
              console.warn(`  ⚠️ Skipping ${key}: missing hospital_name`);
              return null;
            }
            return { key, label: hospital.hospital_name };
          })
          .filter(Boolean);

        console.log("✅ Hospital options parsed:", opts);
        setHospitalOptions(opts);
      },
      (error) => {
        console.error("❌ Firebase error:", error);
        console.error("    Code:", error.code);
        console.error("    Message:", error.message);
      }
    );
    
    return () => {
      console.log("🧹 Cleaning up HospitalDashboard");
      unsubscribe();
    };
  }, []);

  const applyHospitalDataToForm = (hospitalKey, hospitalName, rootData) => {
    console.log(`🏥 applyHospitalDataToForm called for: ${hospitalKey}`);
    console.log(`📦 rootData keys:`, Object.keys(rootData || {}));
    
    const hospital = rootData?.[hospitalKey];
    console.log(`🔍 Hospital found:`, !!hospital);
    console.log(`📊 Hospital data:`, hospital);
    
    if (!hospital) {
      console.warn(`⚠️ No hospital data found for key: ${hospitalKey}`);
      return;
    }

    console.log(`💾 Hospital availability:`, hospital?.availability);
    console.log(`👥 Hospital specialists:`, hospital?.availability?.specialists);

    setFormData((prev) => {
      const specialistsFromDb = hospital?.availability?.specialists || {};
      
      const specialistsState = { ...prev.specialists };

      DEPARTMENTS.forEach((d) => {
        specialistsState[d.id] = specialistsFromDb[d.dbKey] ?? "";
      });

      const newFormData = {
        ...prev,
        hospital: hospitalName,
        availableBeds: hospital?.availability?.beds ?? "",
        icuBeds: hospital?.availability?.icu_beds ?? "",
        status: hospital?.status ?? "Ready",
        specialists: specialistsState
      };
      
      console.log("✅ New formData state being set:", {
        hospital: newFormData.hospital,
        availableBeds: newFormData.availableBeds,
        icuBeds: newFormData.icuBeds,
        status: newFormData.status
      });
      return newFormData;
    });
  };

  const fetchHospitalData = async (hospitalKey, hospitalName) => {
    console.log(`🔍 fetchHospitalData called for: ${hospitalKey}`);
    console.log(`📸 hospitalsSnapshot available:`, !!hospitalsSnapshot);
    
    if (hospitalsSnapshot) {
      console.log(`✅ Using cached snapshot, keys:`, Object.keys(hospitalsSnapshot));
      console.log(`🔑 Looking for key: ${hospitalKey}`);
      console.log(`📋 Data at key:`, hospitalsSnapshot[hospitalKey]);
      applyHospitalDataToForm(hospitalKey, hospitalName, hospitalsSnapshot);
      return;
    }

    console.log(`🌐 Snapshot not cached, fetching from Firebase...`);
    const hospitalRef = ref(db, `/hospitals/${hospitalKey}`);
    const snapshot = await get(hospitalRef);
    console.log(`📦 Firebase fetch complete, exists:`, snapshot.exists());
    
    if (snapshot.exists()) {
      const single = snapshot.val();
      console.log(`✅ Data fetched from Firebase:`, single);
      applyHospitalDataToForm(hospitalKey, hospitalName, {
        [hospitalKey]: single
      });
    } else {
      console.error(`❌ Hospital data not found at /hospitals/${hospitalKey}`);
    }
  };

  const handleHospitalChange = (e) => {
    const hospitalName = e.target.value;
    
    setFormData((prev) => ({
      ...prev,
      hospital: hospitalName
    }));

    setShowDropdown(true);

    if (hospitalName.trim() === "") {
      setFilteredHospitals(hospitalOptions);
    } else {
      const filtered = hospitalOptions.filter((h) =>
        h.label.toLowerCase().includes(hospitalName.toLowerCase())
      );
      setFilteredHospitals(filtered);
    }
  };

  const handleHospitalSelect = async (selectedLabel, selectedKey) => {
    console.log(`👆 Hospital selected: ${selectedLabel} (${selectedKey})`);
    
    setFormData((prev) => ({
      ...prev,
      hospital: selectedLabel
    }));
    setShowDropdown(false);
    setFilteredHospitals([]);
    
    console.log("📡 Fetching hospital data...");
    await fetchHospitalData(selectedKey, selectedLabel);
    console.log("✅ Hospital data fetched and form updated");
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

    const hospitalRef = ref(db, `/hospitals/${hospitalKey}`);

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
            <div style={{ position: "relative" }}>
              <input
                name="hospital"
                value={formData.hospital}
                onChange={handleHospitalChange}
                onFocus={() => {
                  if (!showDropdown) {
                    setShowDropdown(true);
                    if (formData.hospital.trim() === "") {
                      setFilteredHospitals(hospitalOptions);
                    }
                  }
                }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                autoComplete="off"
                placeholder="Search and select hospital..."
                style={{ width: "100%", boxSizing: "border-box" }}
                required
              />
              {showDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "white",
                    border: "1px solid #cbd5e1",
                    borderTop: "none",
                    borderRadius: "0 0 8px 8px",
                    maxHeight: "250px",
                    overflowY: "auto",
                    zIndex: 1000,
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    marginTop: "-1px"
                  }}
                >
                  {filteredHospitals.length > 0 ? (
                    filteredHospitals.map((h) => (
                      <div
                        key={h.key}
                        onClick={() => handleHospitalSelect(h.label, h.key)}
                        style={{
                          padding: "10px 15px",
                          cursor: "pointer",
                          borderBottom: "1px solid #f1f5f9",
                          transition: "background 0.15s"
                        }}
                        onMouseEnter={(e) => (e.target.style.background = "#f0f9ff")}
                        onMouseLeave={(e) => (e.target.style.background = "transparent")}
                      >
                        {h.label}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "10px 15px", color: "#94a3b8", textAlign: "center" }}>
                      {hospitalOptions.length === 0 ? "Loading hospitals..." : "No hospitals found"}
                    </div>
                  )}
                </div>
              )}
            </div>
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
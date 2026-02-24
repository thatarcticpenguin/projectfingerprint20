import React, { useState, useEffect, useRef } from "react";

const PatientForm = ({ onSubmit }) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [dept, setDept] = useState("general_medicine");
  const [disease, setDisease] = useState("");
  const [severity, setSeverity] = useState("critical");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const wrapperRef = useRef(null);

  const locations = [
    { id: "vja_c", name: "Vijayawada Central" },
    { id: "mngl", name: "Mangalagiri" },
    { id: "gnt_c", name: "Guntur City" },
    { id: "tnli", name: "Tenali" },
    { id: "ibhp", name: "Ibrahimpatnam" },
    { id: "cap", name: "Greater Amaravathi" },
  ];

  const departmentData = {
    general_medicine:   ["Unknown/Trauma", "Unconscious", "Severe Fever", "Infection", "Dehydration"],
    cardiology:         ["Heart Attack", "Cardiac Arrest", "Chest Pain", "Arrhythmia", "Heart Failure"],
    neurology:          ["Stroke", "Seizure", "Head Trauma", "Migraine", "Meningitis"],
    orthopedics:        ["Fracture", "Spinal Injury", "Dislocation", "Ligament Tear", "Bone Infection"],
    pulmonology:        ["Asthma Attack", "Pneumonia", "Respiratory Failure", "COPD", "Pulmonary Embolism"],
    gastroenterology:   ["Appendicitis", "GI Bleeding", "Bowel Obstruction", "Severe Gastritis", "Pancreatitis"],
    nephrology:         ["Acute Kidney Failure", "Kidney Stone", "Urinary Tract Infection", "Dialysis Emergency"],
    urology:            ["Urinary Retention", "Kidney Stone", "Bladder Injury", "Testicular Torsion"],
    endocrinology:      ["Diabetic Ketoacidosis", "Hypoglycemia", "Thyroid Storm", "Adrenal Crisis"],
    dermatology:        ["Severe Burns", "Anaphylaxis", "Toxic Skin Reaction", "Infected Wound"],
    pediatrics:         ["High Fever (Child)", "Febrile Seizure", "Respiratory Distress (Child)", "Dehydration (Child)"],
    gynecology:         ["Ectopic Pregnancy", "Labor Emergency", "Severe Hemorrhage", "Ovarian Torsion"],
    ent:                ["Airway Obstruction", "Severe Nosebleed", "Ear Trauma", "Throat Abscess"],
    ophthalmology:      ["Eye Trauma", "Sudden Vision Loss", "Chemical Burn (Eye)", "Retinal Detachment"],
    psychiatry:         ["Suicidal Crisis", "Acute Psychosis", "Severe Panic Attack", "Violent Behavior"],
    oncology:           ["Chemotherapy Complication", "Tumor Bleeding", "Neutropenic Fever", "Bowel Obstruction"],
    radiology:          ["Imaging Emergency", "Contrast Reaction", "Intervention Complication"],
    anesthesiology:     ["Post-Op Complication", "Anesthesia Reaction", "Airway Emergency", "Pain Crisis"],
  };

  const departments = Object.keys(departmentData);

  useEffect(() => {
    setDisease(departmentData[dept]?.[0] || "");
  }, [dept]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (document.getElementById("spin-keyframes")) return;
    const styleSheet = document.createElement("style");
    styleSheet.id = "spin-keyframes";
    styleSheet.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(styleSheet);
    return () => {
      const el = document.getElementById("spin-keyframes");
      if (el) el.remove();
    };
  }, []);

  const handleInstantRescue = () => {
    const finalLocation = selectedLocation ? selectedLocation.name : query.trim();
    if (!finalLocation) { setError("⚠ Please enter emergency location"); return; }
    setError("");
    setLoading(true);
    setTimeout(() => {
      onSubmit({ dept: "general_medicine", disease: "Unknown/Trauma", severity: "critical", location: finalLocation, isGoldenHour: true });
      setLoading(false);
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalLocation = selectedLocation ? selectedLocation.name : query.trim();
    if (!finalLocation) { setError("⚠ Please enter a location"); return; }
    setError("");
    setLoading(true);
    setTimeout(() => {
      onSubmit({ dept, disease, severity, location: finalLocation });
      setLoading(false);
    }, 1500);
  };

  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(query.toLowerCase())
  );

  const formatDeptLabel = (d) =>
    d.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>
        <span style={{ fontSize: "2rem" }}>🚑</span> Emergency Patient Intake
      </h2>

      <button type="button" onClick={handleInstantRescue} disabled={loading}
        style={{ ...styles.goldenButton, fontSize: "17px", padding: "16px 24px" }}>
        {loading && <div style={styles.spinner} />}
        🚨 INSTANT RESCUE – GOLDEN HOUR
      </button>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div ref={wrapperRef} style={{ position: "relative" }}>
          <label htmlFor="location" style={styles.label}>Location *</label>
          <input
            id="location" type="text"
            placeholder="Search your area or hospital..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); setSelectedLocation(null); }}
            autoComplete="off" required style={styles.input}
          />
          {showSuggestions && query.length > 0 && (
            <div style={styles.dropdown}>
              {filteredLocations.length === 0
                ? <div style={{ padding: "12px", color: "#64748b" }}>No matching locations</div>
                : filteredLocations.map((loc) => (
                  <div key={loc.id}
                    onClick={() => { setSelectedLocation(loc); setQuery(loc.name); setShowSuggestions(false); }}
                    style={{ ...styles.dropdownItem, background: selectedLocation?.id === loc.id ? "#e0f2fe" : "transparent" }}>
                    {loc.name}
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <label htmlFor="department" style={styles.label}>Department</label>
        <select id="department" value={dept} onChange={(e) => setDept(e.target.value)} style={styles.input}>
          {departments.map((d) => (
            <option key={d} value={d}>{formatDeptLabel(d)}</option>
          ))}
        </select>

        <label htmlFor="condition" style={styles.label}>Condition / Disease</label>
        <select id="condition" value={disease} onChange={(e) => setDisease(e.target.value)} style={styles.input}>
          {departmentData[dept]?.map((dis) => (
            <option key={dis} value={dis}>{dis}</option>
          ))}
        </select>

        <label htmlFor="severity" style={styles.label}>Severity</label>
        <select id="severity" value={severity} onChange={(e) => setSeverity(e.target.value)} style={styles.input}>
          <option value="critical">🔴 Critical</option>
          <option value="moderate">🟡 Moderate</option>
          <option value="stable">🟢 Stable</option>
        </select>

        <button type="submit" disabled={loading}
          style={{ ...styles.submitButton, opacity: loading ? 0.7 : 1 }}>
          {loading && <div style={styles.spinner} />}
          {loading ? "Finding nearest help..." : "🔍 Search Facilities"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: "13px", color: "#9ca3af", marginTop: "24px" }}>
        Made with ❤️ for faster emergency care
      </p>
    </div>
  );
};

const styles = {
  card: { maxWidth: "540px", margin: "auto", padding: "32px", borderRadius: "16px",
    background: "white", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", gap: "24px" },
  title: { textAlign: "center", margin: 0, color: "#1e293b", fontSize: "1.9rem", fontWeight: "700",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  label: { fontSize: "15px", fontWeight: "700", color: "#334155" },
  input: { padding: "14px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "15px", outline: "none", transition: "all 0.2s" },
  dropdown: { position: "absolute", width: "100%", background: "white", border: "1px solid #e2e8f0",
    borderRadius: "10px", marginTop: "6px", boxShadow: "0 6px 16px rgba(0,0,0,0.12)", zIndex: 100, maxHeight: "240px", overflowY: "auto" },
  dropdownItem: { padding: "12px 16px", cursor: "pointer", transition: "background 0.15s" },
  submitButton: { padding: "16px", borderRadius: "10px", border: "none", background: "#0f172a", color: "white",
    fontWeight: "bold", fontSize: "16px", marginTop: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" },
  error: { color: "#ef4444", fontSize: "13px", marginTop: "-6px" },
  goldenButton: { background: "#dc2626", color: "white", border: "none", padding: "16px 24px", borderRadius: "12px",
    fontWeight: "bold", fontSize: "17px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" },
  spinner: { width: "20px", height: "20px", border: "4px solid rgba(255,255,255,0.3)",
    borderTop: "4px solid white", borderRadius: "50%", animation: "spin 1s linear infinite" },
};

export default PatientForm;
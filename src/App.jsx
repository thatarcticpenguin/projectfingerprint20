import { useState, useMemo, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import PatientForm from "./PatientForm";
import Login from "./LoginPage";
import Signup from "./RegisterPage";
import MapView from "./MapView";
import DashboardTabs from "./navtabs";
import { db } from "./firebase";
import { ref, onValue } from "firebase/database";



function parseHospitals(data) {
  if (!data) return [];
  return Object.entries(data).map(([firebaseKey, h]) => {
    const beds            = h.availability?.beds     ?? 0;
    const icuBeds         = h.availability?.icu_beds ?? 0;
    const specialists     = h.availability?.specialists ?? {};
    const specialistCount = Object.values(specialists).reduce((a, b) => a + (Number(b) || 0), 0);
    const statusMap       = { Ready: "green", Busy: "yellow", Full: "red" };
    const status          = statusMap[h.status] ?? "green";
    return {
      id:             h.hospital_id,
      firebaseKey,                        
      name:           h.hospital_name,
      lat:            h.coordinates.lat,
      lng:            h.coordinates.lng,
      beds,
      icuBeds,
      specialists,
      specialistCount,
      status,
    };
  });
}



function calculateDistance(lat1, lon1, lat2, lon2) {
  const R    = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}


function scoreHospitals(hospitals) {
  if (!hospitals.length) return [];
  const maxBeds = Math.max(...hospitals.map(h => h.beds), 1);
  const maxIcu  = Math.max(...hospitals.map(h => h.icuBeds), 1);
  const maxSpec = Math.max(...hospitals.map(h => h.specialistCount), 1);
  return hospitals.map(h => {
    const travelTime = (h.distance / 40) * 60 || 0.1;
    const score =
      (h.beds / maxBeds)            * 0.35 +
      (h.icuBeds / maxIcu)          * 0.30 +
      (h.specialistCount / maxSpec) * 0.20 +
      (1 / travelTime)              * 0.15;
    return { ...h, score };
  }).sort((a, b) => b.score - a.score);
}



function PatientFormPage() {
  const navigate = useNavigate();
  const handleSearch = (data) => {
    
    navigate("/map", { state: { patientData: data } });
  };
  return <PatientForm onSubmit={handleSearch} />;
}



function HospitalFinder() {
  const [hospitals, setHospitals]               = useState([]);
  const [dbLoading, setDbLoading]               = useState(true);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showAll, setShowAll]                   = useState(false);
  const [navigationStarted, setNavigationStarted] = useState(false);
  const [patientData, setPatientData]           = useState(null);

  const location = useLocation();

  
  useEffect(() => {
    if (location.state?.patientData) {
      setPatientData(location.state.patientData);
    }
  }, [location.state]);

  
  useEffect(() => {
    const hospitalsRef = ref(db, "hospitals");
    const unsub = onValue(hospitalsRef, (snapshot) => {
      setHospitals(parseHospitals(snapshot.val() ?? {}));
      setDbLoading(false);
    }, (err) => {
      console.error("Firebase error:", err);
      setDbLoading(false);
    });
    return () => unsub();
  }, []);

  
  const userLocation = useMemo(() => {
    if (patientData?.location?.lat && patientData?.location?.lng) {
      return { lat: patientData.location.lat, lng: patientData.location.lng, heading: null };
    }
    return null;
  }, [patientData]);

  const hospitalsWithDistance = useMemo(() =>
    userLocation
      ? hospitals.map((h) => ({
          ...h,
          distance: calculateDistance(userLocation.lat, userLocation.lng, h.lat, h.lng),
          availabilityPercent: Math.round((h.beds / Math.max(h.beds + h.icuBeds, 1)) * 100),
        }))
      : [],
    [userLocation, hospitals]
  );

  const scoredHospitals = useMemo(() =>
    scoreHospitals(hospitalsWithDistance.filter(h => h.status !== "red")),
    [hospitalsWithDistance]
  );

  const recommended = scoredHospitals.slice(0, 2);

  const getBarColor = (p) => p > 70 ? "#16a34a" : p > 40 ? "#d97706" : "#dc2626";

  
  if (dbLoading || !userLocation) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: "60vh", gap: "16px", color: "#475569" }}>
        <span style={{ fontSize: 40 }}>📍</span>
        <p style={{ margin: 0, fontWeight: 600 }}>
          {dbLoading ? "Loading hospital data…" : "Waiting for location data…"}
        </p>
      </div>
    );
  }

  if (selectedHospital) {
    return (
      <MapView
        hospitals={scoredHospitals}
        userLocation={userLocation}
        selectedHospital={selectedHospital}
        navigationStarted={navigationStarted}
        setNavigationStarted={setNavigationStarted}
        setSelectedHospital={setSelectedHospital}
        patientData={patientData}
      />
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Emergency Hospital Finder</h2>

      {patientData && (
        <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: "8px",
          padding: "10px 14px", marginBottom: "16px", fontSize: "14px" }}>
          🚨 <strong>{patientData.severity?.toUpperCase()}</strong> — {patientData.disease}
          &nbsp;|&nbsp; {patientData.dept?.replace(/_/g, " ")}
          {patientData.isGoldenHour && <span style={{ color: "#dc2626", fontWeight: "bold" }}> ⚡ GOLDEN HOUR</span>}
        </div>
      )}

      <h3>Top Recommended</h3>
      {recommended.map((h, index) => (
        <div key={h.id} style={cardStyle(true)}
          onClick={() => { setSelectedHospital(h); setNavigationStarted(false); }}>
          <strong>#{index + 1} Recommended</strong>&nbsp;
          <span style={{ fontSize: "12px", color: "#64748b" }}>Score: {(h.score * 100).toFixed(0)}</span><br />
          <strong>{h.name}</strong><br />
          Beds: {h.beds} &nbsp;|&nbsp; ICU: {h.icuBeds} &nbsp;|&nbsp; Specialists: {h.specialistCount}<br />
          Distance: {h.distance.toFixed(2)} km
          <div style={barContainer}>
            <div style={{ ...barFill, width: `${h.availabilityPercent}%`, background: getBarColor(h.availabilityPercent) }} />
          </div>
          <small>{h.availabilityPercent}% Bed Availability</small>
        </div>
      ))}

      {!showAll && scoredHospitals.length > 2 && (
        <button onClick={() => setShowAll(true)} style={viewMoreStyle}>
          View More ({scoredHospitals.length - 2} more)
        </button>
      )}

      {showAll && (
        <>
          <h3 style={{ marginTop: "20px" }}>All Hospitals</h3>
          {scoredHospitals.map((h) => (
            <div key={h.id} style={cardStyle(false)}
              onClick={() => { setSelectedHospital(h); setNavigationStarted(false); }}>
              <strong>{h.name}</strong><br />
              Beds: {h.beds} &nbsp;|&nbsp; ICU: {h.icuBeds} &nbsp;|&nbsp; Specialists: {h.specialistCount}<br />
              Distance: {h.distance.toFixed(2)} km &nbsp;|&nbsp;
              Score: {(h.score * 100).toFixed(0)}
            </div>
          ))}
        </>
      )}
    </div>
  );
}



const cardStyle = (isRecommended) => ({
  padding: "12px", marginBottom: "12px", background: "white",
  borderRadius: "8px", border: isRecommended ? "2px solid gold" : "1px solid #ddd",
  cursor: "pointer",
});

const viewMoreStyle = {
  padding: "8px 14px", background: "#2563eb", color: "white",
  border: "none", borderRadius: "6px", marginTop: "10px", cursor: "pointer",
};

const barContainer = {
  height: "8px", background: "#e5e7eb", borderRadius: "4px",
  marginTop: "6px", marginBottom: "4px",
};

const barFill = {
  height: "8px", borderRadius: "4px", transition: "width 0.4s ease",
};



function LanguageSwitcher() {
  useEffect(() => {
    if (document.querySelector(".goog-te-combo")) return;
    if (document.getElementById("google-translate-script")) return;

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", includedLanguages: "en,hi,te,ta,kn,ml",
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE, autoDisplay: false },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const el = document.getElementById("google-translate-script");
      if (el) el.remove();
      delete window.googleTranslateElementInit;
    };
  }, []);

  return <div id="google_translate_element" style={{ minWidth: "160px" }} />;
}



function AppInner() {
  const location = useLocation();
  const hideNav = ["/", "/register", "/login"].includes(location.pathname);

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-slate-50 font-sans">
      {!hideNav && (
      <nav className="w-full h-16 bg-slate-900 flex items-center justify-between px-6 md:px-10 shadow-lg mb-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-red-500 opacity-30 animate-ping" />
            <div className="relative bg-red-500 text-white rounded-full p-2 shadow-sm">
              <span className="text-xl">📍</span>
            </div>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">
            Finding Nearest Help
          </span>
        </div>
        <div className="flex items-center">
          <LanguageSwitcher />
        </div>
      </nav>
      )}

      <main className="w-full max-w-2xl px-4 pb-12 flex flex-col items-center">
        <Routes>
          <Route path="/"          element={<Login />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/register"  element={<Signup />} />
          <Route path="/form"      element={<PatientFormPage />} />
          <Route path="/hdash"     element={<DashboardTabs />} />
          <Route path="/map"       element={<HospitalFinder />} />
          <Route path="/hospitals" element={<HospitalFinder />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return <AppInner />;
}

export default App;
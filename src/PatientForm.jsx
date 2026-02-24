// ------- FIREBASE CONFIG ---------
import { useState, useEffect } from "react";
import { ref, get, onValue } from "firebase/database";
import { db } from "./firebase";

// Departments config (UI value + label + Firebase specialists key)
const DEPARTMENTS = [
  { value: "general_medicine", label: "General Medicine", dbKey: "general" },
  { value: "cardiology", label: "Cardiology", dbKey: "cardiac" },
  { value: "neurology", label: "Neurology", dbKey: "neurology" },
  { value: "orthopedics", label: "Orthopedics", dbKey: "orthopedic" },
  { value: "pulmonology", label: "Pulmonology", dbKey: "pulmonology" },
  { value: "nephrology", label: "Nephrology", dbKey: "nephrology" },
  { value: "urology", label: "Urology", dbKey: "urology" },
  { value: "dermatology", label: "Dermatology", dbKey: "dermatology" },
  { value: "pediatrics", label: "Pediatrics", dbKey: "pediatrics" },
  { value: "gynecology", label: "Gynecology", dbKey: "gynecology" },
  { value: "ent", label: "ENT", dbKey: "ent" },
  { value: "ophthalmology", label: "Ophthalmology", dbKey: "ophthalmology" },
  { value: "psychiatry", label: "Psychiatry", dbKey: "psychiatry" },
  { value: "oncology", label: "Oncology", dbKey: "oncology" },
  { value: "radiology", label: "Radiology", dbKey: "radiology" },
  { value: "anesthesiology", label: "Anesthesiology", dbKey: "anesthesiology" }
];

const userLocation = {
  lat: 16.5062,
  lng: 80.6480
};

function distanceKm(lat1, long1, lat2, long2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (long2 - long1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// SCORING FORMULA
function calculateScore(beds, icu, specialists, distance) {
  const distanceScore = Math.max(0, 10 - distance);
  return (beds * 0.35 + icu * 0.30 + specialists * 0.20 + distanceScore * 0.15).toFixed(2);
}

export default function PatientForm() {
  const [specialist, setSpecialist] = useState("cardiology");
  const [results, setResults] = useState([]);
  const [hospitalsSnapshot, setHospitalsSnapshot] = useState(null);

  // 🔁 Live subscription to hospitals for always-fresh data
  useEffect(() => {
    const hospitalsRef = ref(db, "/hospitals");
    const unsubscribe = onValue(hospitalsRef, (snapshot) => {
      setHospitalsSnapshot(snapshot.val() || {});
    });
    return () => unsubscribe();
  }, []);

  async function handleFind() {
    const hospitalsData =
      hospitalsSnapshot ||
      (await (async () => {
        const snapshot = await get(ref(db, "/hospitals"));
        return snapshot.val();
      })());

    if (!hospitalsData) {
      setResults([]);
      return;
    }

    const computed = Object.values(hospitalsData)
      .map((hospitalArr) => {
        const hospital = Array.isArray(hospitalArr) ? hospitalArr[0] : null;
        if (!hospital || !hospital.availability) {
          return null;
        }

        const beds = hospital.availability.beds ?? 0;
        const icu = hospital.availability.icu_beds ?? 0;

        const selectedDept = DEPARTMENTS.find((d) => d.value === specialist);
        const specialistKey = selectedDept?.dbKey ?? specialist;
        const specialistsOnDuty =
          (hospital.availability.specialists || {})[specialistKey] || 0;

        const dist = distanceKm(
          userLocation.lat,
          userLocation.lng,
          hospital.coordinates.lat,
          hospital.coordinates.lng
        );

        const score = calculateScore(
          beds,
          icu,
          specialistsOnDuty,
          dist
        );

        return {
          name: hospital.hospital_name,
          distance: dist.toFixed(2),
          beds,
          icu,
          specialistsOnDuty,
          score: Number(score)   // 👈 ensure numeric
        };
      })
      .filter(Boolean);

    // 🔥 SORT BY SCORE (HIGH → LOW)
    computed.sort((a, b) => b.score - a.score);

    setResults(computed);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Hospital Availability Score</h2>

      <select
        value={specialist}
        onChange={(e) => setSpecialist(e.target.value)}
      >
        {DEPARTMENTS.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </select>

      <button onClick={handleFind} style={{ marginLeft: "10px" }}>
        Find
      </button>

      <div style={{ marginTop: "20px" }}>
        {results.map((h, i) => (
          <div key={i} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
            <strong>{h.name}</strong><br />
            Distance: {h.distance} km<br />
            Beds: {h.beds}, ICU: {h.icu}<br />
            Specialists available: {h.specialistsOnDuty}<br />
            <b>Score: {h.score}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

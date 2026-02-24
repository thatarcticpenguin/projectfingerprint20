// ------- FIREBASE CONFIG ---------
import { useState } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBnFvGMImnUQoe8dGtq32Yz-a8_6bMtjFQ",
  authDomain: "projectyelamudhram.firebaseapp.com",
  databaseURL: "https://projectyelamudhram-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "projectyelamudhram",
  storageBucket: "projectyelamudhram.firebasestorage.app",
  messagingSenderId: "583393678546",
  appId: "1:583393678546:web:4c877bbfba740ed375890b"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

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
  const [specialist, setSpecialist] = useState("cardiac");
  const [results, setResults] = useState([]);

  async function handleFind() {
  const snapshot = await get(ref(db, "/"));
  const data = snapshot.val();

  const computed = Object.values(data).map((hospitalArr) => {
    const hospital = hospitalArr[0];

    const beds = hospital.availability.beds;
    const icu = hospital.availability.icu_beds;
    const specialistsOnDuty =
      hospital.availability.specialists[specialist] || 0;

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
  });

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
        <option value="cardiac">Cardiology</option>
        <option value="neurology">Neurology</option>
        <option value="orthopedic">Orthopedics</option>
        <option value="pediatrics">Pediatrics</option>
        <option value="pulmonology">Pulmonology</option>
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

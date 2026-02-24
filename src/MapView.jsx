import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import L from 'leaflet'
import 'leaflet-routing-machine'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useEffect, useRef, useState } from 'react'
import { db } from './firebase'
import { ref, push } from 'firebase/database'

/* 🏥 HOSPITAL PIN */
const hospitalIcon = (status) => {
  const colors = { green: "#16a34a", yellow: "#f59e0b", red: "#dc2626" }
  return L.divIcon({
    html: `
      <svg width="40" height="55" viewBox="0 0 24 36">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z"
          fill="${colors[status]}" stroke="white" stroke-width="2.5"/>
        <circle cx="12" cy="12" r="5" fill="white"/>
      </svg>`,
    className: "",
    iconSize: [40, 55],
    iconAnchor: [20, 50],
    popupAnchor: [0, -45]
  })
}

/* 👤 USER ICON */
const userIcon = (heading) => L.divIcon({
  html: `<div style="font-size:28px;transform:translate(-50%,-50%) ${heading != null ? `rotate(${heading}deg)` : ''}">
    ${heading != null ? '▲' : '👤'}</div>`,
  className: "",
  iconSize: [30, 30],
  iconAnchor: [15, 15]
})

/* ✈ Fly To Selected Hospital */
function FlyToSelected({ selectedHospital, markerRefs }) {
  const map = useMap()
  useEffect(() => {
    if (selectedHospital) {
      map.flyTo([selectedHospital.lat, selectedHospital.lng], 15, { duration: 1.2 })
      setTimeout(() => {
        const marker = markerRefs.current[selectedHospital.id]
        if (marker) marker.openPopup()
      }, 1000)
    }
  }, [selectedHospital, map, markerRefs])
  return null
}

/* 🧭 Follow User */
function FollowUser({ userLocation, navigationStarted }) {
  const map = useMap()
  useEffect(() => {
    if (navigationStarted && userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 17, { animate: true })
    }
  }, [userLocation, navigationStarted, map])
  return null
}

/* 🛣 Routing — resets on hospital/navigation change */
function Routing({ userLocation, selectedHospital, navigationStarted }) {
  const map = useMap()
  const routingRef = useRef(null)

  useEffect(() => {
    if (routingRef.current) {
      map.removeControl(routingRef.current)
      routingRef.current = null
    }
    if (!navigationStarted || !selectedHospital || !userLocation) return

    routingRef.current = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(selectedHospital.lat, selectedHospital.lng)
      ],
      router: L.Routing.osrmv1({ serviceUrl: "https://router.project-osrm.org/route/v1" }),
      lineOptions: { styles: [{ color: "#2563eb", weight: 6 }] },
      addWaypoints: false,
      draggableWaypoints: false,
      createMarker: () => null,
      show: true
    }).on('routingerror', (e) => console.error('Routing error:', e.error)).addTo(map)

    return () => {
      if (routingRef.current) {
        map.removeControl(routingRef.current)
        routingRef.current = null
      }
    }
  }, [selectedHospital, userLocation, navigationStarted, map])

  return null
}

/* 🗺 MAIN MAP */
function MapView({
  hospitals,
  userLocation,
  selectedHospital,
  navigationStarted,
  setNavigationStarted,
  setSelectedHospital,
  patientData
}) {
  const markerRefs = useRef({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  if (!userLocation) return null

  const handleSendPatient = async (hospital) => {
    setSending(true)
    try {
      const patientRef = ref(db, `hospitals/${hospital.firebaseKey}/patients`)
      await push(patientRef, {
        timestamp:    new Date().toISOString(),
        timestamp_ms: Date.now(),
        status:       "incoming",
        dept:         patientData?.dept         ?? "general_medicine",
        disease:      patientData?.disease      ?? "Unknown",
        severity:     patientData?.severity     ?? "critical",
        location:     patientData?.location     ?? "Unknown",
        isGoldenHour: patientData?.isGoldenHour ?? false,
        assignedHospital: {
          id:   hospital.id,
          name: hospital.name,
        }
      })
      setSent(true)
    } catch (err) {
      console.error("Failed to send patient:", err)
      alert("Failed to send patient details. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    setSelectedHospital(null)
    setNavigationStarted(false)
    setSent(false)
  }

  return (
    <>
      {/* Full-screen map — rendered outside any constraining flex/max-w container */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 500 }}>
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FlyToSelected selectedHospital={selectedHospital} markerRefs={markerRefs} />
          <Routing userLocation={userLocation} selectedHospital={selectedHospital} navigationStarted={navigationStarted} />
          <FollowUser userLocation={userLocation} navigationStarted={navigationStarted} />

          {/* 👤 USER MARKER */}
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon(userLocation.heading)}>
            <Popup>You are here</Popup>
          </Marker>

          {/* 🏥 HOSPITAL MARKERS */}
          {hospitals.map(h => (
            <Marker
              key={h.id}
              position={[h.lat, h.lng]}
              icon={hospitalIcon(h.status)}
              ref={(r) => { if (r) markerRefs.current[h.id] = r }}
            >
              <Popup>
                <strong>{h.name}</strong><br />
                Beds: {h.beds} &nbsp;|&nbsp; ICU: {h.icuBeds}<br />
                Distance: {h.distance?.toFixed(2)} km
                <br /><br />
                <button
                  onClick={() => {
                    setSelectedHospital(h)
                    setNavigationStarted(true)
                    setSent(false)
                  }}
                  style={{ padding: "8px 12px", background: "#2563eb", color: "white",
                    border: "none", borderRadius: "8px", cursor: "pointer" }}
                >
                  🚗 Start Directions
                </button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* 🔙 BACK BUTTON — fixed, above map */}
      <button
        onClick={handleClose}
        style={{
          position: "fixed", top: "16px", left: "16px", zIndex: 9999,
          padding: "10px 18px", background: "#0f172a", color: "white",
          border: "none", borderRadius: "8px", fontWeight: "bold",
          fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
        }}
      >
        ← Back
      </button>

      {/* ── Send Patient Details panel — fixed to bottom of viewport, always visible ── */}
      {selectedHospital && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
          background: "white", padding: "16px 20px",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.18)",
          display: "flex", flexDirection: "column", gap: "10px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong style={{ fontSize: "16px" }}>{selectedHospital.name}</strong><br />
              <span style={{ fontSize: "13px", color: "#64748b" }}>
                Beds: {selectedHospital.beds} &nbsp;|&nbsp; ICU: {selectedHospital.icuBeds} &nbsp;|&nbsp; {selectedHospital.distance?.toFixed(2)} km away
              </span>
            </div>
            <button
              onClick={handleClose}
              style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#94a3b8", lineHeight: 1 }}
            >
              ✕
            </button>
          </div>

          {sent ? (
            <div style={{
              background: "#dcfce7", color: "#16a34a", borderRadius: "8px",
              padding: "14px", textAlign: "center", fontWeight: "bold", fontSize: "15px"
            }}>
              ✅ Patient details sent to {selectedHospital.name}!
            </div>
          ) : (
            <button
              onClick={() => handleSendPatient(selectedHospital)}
              disabled={sending}
              style={{
                padding: "14px", background: sending ? "#94a3b8" : "#dc2626",
                color: "white", border: "none", borderRadius: "10px",
                cursor: sending ? "not-allowed" : "pointer",
                fontWeight: "bold", fontSize: "15px",
                transition: "background 0.2s"
              }}
            >
              {sending ? "Sending…" : "📋 Send Patient Details to Hospital"}
            </button>
          )}
        </div>
      )}
    </>
  )
}

export default MapView

import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import L from 'leaflet'
import 'leaflet-routing-machine'

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from 'react-leaflet'

import { useEffect, useRef } from 'react'

/* 🏥 ORIGINAL HOSPITAL PIN (RESTORED) */
const hospitalIcon = (status) => {
  const colors = {
    green: "#16a34a",
    yellow: "#f59e0b",
    red: "#dc2626"
  }

  return L.divIcon({
    html: `
      <svg width="40" height="55" viewBox="0 0 24 36">
        <path 
          d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z"
          fill="${colors[status]}"
          stroke="white"
          stroke-width="2.5"
        />
        <circle cx="12" cy="12" r="5" fill="white"/>
      </svg>
    `,
    className: "",
    iconSize: [40, 55],
    iconAnchor: [20, 50],
    popupAnchor: [0, -45]
  })
}

/* 👤 SIMPLE PERSON ICON WITH DIRECTION */
const userIcon = (heading) => L.divIcon({
  html: `
    <div style="
      font-size:28px;
      transform: translate(-50%, -50%) ${heading != null ? `rotate(${heading}deg)` : ''};
    ">
      ${heading != null ? '▲' : '👤'}
    </div>
  `,
  className: "",
  iconSize: [30, 30],
  iconAnchor: [15, 15]
})

/* ✈ Fly To Selected Hospital */
function FlyToSelected({ selectedHospital, markerRefs }) {
  const map = useMap()

  useEffect(() => {
    if (selectedHospital) {
      map.flyTo(
        [selectedHospital.lat, selectedHospital.lng],
        15,
        { duration: 1.2 }
      )

      setTimeout(() => {
        const marker = markerRefs.current[selectedHospital.id]
        if (marker) marker.openPopup()
      }, 1000)
    }
  }, [selectedHospital, map, markerRefs])

  return null
}

/* 🧭 FOLLOW USER WHILE NAVIGATING */
function FollowUser({ userLocation, navigationStarted }) {
  const map = useMap()

  useEffect(() => {
    if (navigationStarted && userLocation) {
      map.setView(
        [userLocation.lat, userLocation.lng],
        17,
        { animate: true }
      )
    }
  }, [userLocation, navigationStarted, map])

  return null
}

/* 🛣 ROUTING */
function Routing({ userLocation, selectedHospital, navigationStarted }) {
  const map = useMap()
  const routingRef = useRef(null)

  useEffect(() => {
    if (!selectedHospital || !userLocation) return

    if (!routingRef.current) {
      routingRef.current = L.Routing.control({
        waypoints: [
          L.latLng(userLocation.lat, userLocation.lng),
          L.latLng(selectedHospital.lat, selectedHospital.lng)
        ],
        router: L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1"
          // Note: This uses the OSRM demo server, which logs a warning in console.
          // For hackathon demos, this is fine—it's free and quick. Ignore the warning;
          // it won't affect app functionality or visibility to judges.
        }),
        lineOptions: {
          styles: [{ color: "#2563eb", weight: 6 }]
        },
        addWaypoints: false,
        draggableWaypoints: false,
        createMarker: () => null,
        show: navigationStarted
      }).on('routingerror', (e) => {
        console.error('Routing error:', e.error)
      }).addTo(map)
    } else {
      routingRef.current.setWaypoints([
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(selectedHospital.lat, selectedHospital.lng)
      ])
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
  setSelectedHospital // Added prop for back
}) {
  const markerRefs = useRef({})

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={13}
        style={{ height: "100vh", width: "100%" }}
      >

        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyToSelected
          selectedHospital={selectedHospital}
          markerRefs={markerRefs}
        />

        <Routing
          userLocation={userLocation}
          selectedHospital={selectedHospital}
          navigationStarted={navigationStarted}
        />

        <FollowUser
          userLocation={userLocation}
          navigationStarted={navigationStarted}
        />

        {/* 👤 USER */}
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={userIcon(userLocation.heading)}
        >
          <Popup>You are here</Popup>
        </Marker>

        {/* 🏥 HOSPITALS */}
        {hospitals.map(h => (
          <Marker
            key={h.id}
            position={[h.lat, h.lng]}
            icon={hospitalIcon(h.status)}
            ref={(ref) => {
              if (ref) markerRefs.current[h.id] = ref
            }}
          >
            <Popup>
              <strong>{h.name}</strong><br/>
              Beds: {h.beds}<br/>
              Distance: {h.distance?.toFixed(2)} km
              <br/><br/>

              {!navigationStarted && (
                <button
                  onClick={() => setNavigationStarted(true)}
                  style={{
                    padding: "8px 12px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  🚗 Start Directions
                </button>
              )}
            </Popup>
          </Marker>
        ))}

      </MapContainer>

      {/* 🔙 BACK BUTTON */}
      <button
        onClick={() => {
          setSelectedHospital(null)
          setNavigationStarted(false)
        }}
        className="back-btn"
      >
        Back
      </button>

    </div>
  )
}

export default MapView

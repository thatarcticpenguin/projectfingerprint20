import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Routing from "./Routing";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const userLocation = {
  lat: 16.5062,
  lng: 80.6480
};

const hospitalLocation = {
  lat: 16.5219,
  lng: 80.6776
};

export default function MapView() {
  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={13}
      style={{ height: "100vh", width: "100vw" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />

      <Marker position={[userLocation.lat, userLocation.lng]}>
        <Popup>You</Popup>
      </Marker>

      <Marker position={[hospitalLocation.lat, hospitalLocation.lng]}>
        <Popup>Hospital</Popup>
      </Marker>

      <Routing from={userLocation} to={hospitalLocation} />
    </MapContainer>
  );
}
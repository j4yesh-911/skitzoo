import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView({ users }) {
  return (
    <MapContainer center={[23.0225, 72.5714]} zoom={12} className="h-80 rounded-xl">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {users.map((u, i) => (
        <Marker key={i} position={[u.lat, u.lng]} />
      ))}
    </MapContainer>
  );
}

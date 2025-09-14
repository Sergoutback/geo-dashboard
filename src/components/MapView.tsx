import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type Pt = { id: number; name: string; lat: number; lon: number };

export default function MapView({ points }: { points: Pt[] }) {
  return (
    <div style={{ height: 420 }}>
      <MapContainer center={[25.2048, 55.2708]} zoom={11} style={{ height: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {points.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lon]}>
            <Popup>{p.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

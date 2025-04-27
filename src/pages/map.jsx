import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import CompassSVG from '../components/compass';

// Standard-Marker-Icons fixen
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DraggableMarker = () => {
  const [position, setPosition] = useState([48.150901, 11.571602]);
  const markerRef = useRef(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        setPosition([newPos.lat, newPos.lng]);
      }
    },
  };

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    >
      <Popup>
        <b>Verschieb mich!</b><br />
        Latitude: {position[0].toFixed(6)}<br />
        Longitude: {position[1].toFixed(6)}
      </Popup>
    </Marker>
  );
};

const MapView = () => {
  return (
    <div style={{ position: 'relative', height: '60vh', width: '100%' }}>
      {/* MapContainer als Hintergrund */}
      <MapContainer
        center={[47.666873, 9.444825]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[47.666873, 9.444825]}>
          <Popup>
            Hier ist ein fester Marker! 📍
          </Popup>
        </Marker>
        <DraggableMarker />
      </MapContainer>

      {/* Kompass über der Karte */}
      <div style={{
        position: 'absolute',
        top: '2%',
        right: '2%',
        aspectRatio: '1',
        maxWidth: '5rem',
        maxHeight: '5rem',
        zIndex: 1000,
        pointerEvents: 'none',       // blockiert Maus-Events
        userSelect: 'none',           // verhindert Text- oder Bildauswahl
      }}>
        <CompassSVG />
      </div>
    </div>
  );
};

export default MapView;

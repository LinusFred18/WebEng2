import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRef, useState, useEffect } from 'react';
import useGPSLocation from './gps';  // import Hook

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

const GPSDraggableMarker = () => {
  const { gpsLocation } = useGPSLocation();
  const fallbackPosition = [47.666873, 9.444825];
  const [position, setPosition] = useState(fallbackPosition);
  const markerRef = useRef(null);

  // Set GPS-Koordinaten, if avaible
  useEffect(() => {
    if (gpsLocation) {
      setPosition([gpsLocation.latitude, gpsLocation.longitude]);
    }
  }, [gpsLocation]);

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
        <b>GPS Marker</b><br />
        Latitude: {position[0].toFixed(6)}<br />
        Longitude: {position[1].toFixed(6)}
      </Popup>
    </Marker>
  );
};

const MapView = () => {
  return (
    <MapContainer center={[47.666873, 9.444825]} zoom={13} scrollWheelZoom={true} style={{ height: '60vh', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* GPS Marker */}
      <GPSDraggableMarker />

      {/* Second Marker 2 */}
      <DraggableMarker />
    </MapContainer>
  );
};

export default MapView;

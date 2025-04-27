import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';

// Standard-Marker-Icons fixen
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});


const DraggableMarker = ({ setLatitude, setLongitude }) => {
  const [position, setPosition] = useState([48.150901, 11.571602]);
  const markerRef = useRef(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        setPosition([newPos.lat, newPos.lng]);
        setLatitude(newPos.lat)
        setLongitude(newPos.lng)
        console.log("B: ", newPos.lat, newPos.lng)
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
        Latitude: {position[0]?.toFixed(6)}<br />
        Longitude: {position[1]?.toFixed(6)}
      </Popup>
    </Marker>
  );
};


const MapView = ({latitude, longitude, setLatitude, setLongitude}) => {
  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);
  console.log('Latitude:', latitude, 'Longitude:', longitude);

  useEffect(() => {
    if (latitude) {
      setLat(latitude);
    }
    if (longitude) {
      setLong(longitude);
    }
  }, [latitude, longitude]); // <-- immer neu suchen, wenn sich die query ändert!
  

  if (lat == null || long == null) {
    return <div>Lade Karte...</div>;
  }


  return (
    <MapContainer center={[lat, long]} zoom={13} scrollWheelZoom={true} style={{ height: '60vh', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Fester Marker */}
      <Marker position={[lat, long]}>
        <Popup>
          Hier ist ein fester Marker! 📍
        </Popup>
      </Marker>

      {/* Verschiebbarer Marker */}
      <DraggableMarker setLatitude={setLatitude} setLongitude={setLongitude}/>
    </MapContainer>
  );
};

export default MapView;

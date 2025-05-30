import { MapContainer, TileLayer, Marker, Popup, Polyline, } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef, useState, forwardRef, useImperativeHandle,} from 'react';
import { Icon } from 'framework7-react';
import useGPSLocation from './gps';
import CompassSVG from '../components/compass';

const bookmarkButtonStyle = {
  borderRadius: '50%',
  width: '48px',
  height: '48px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  border: '1px solid #d0d0d0',
  backgroundColor: '#fff',
  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  padding: 0,
  cursor: 'pointer',
  marginTop: '8px',
};

// Standard-Marker-Icons fixen
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const DraggableMarker = ({ setLatitude, setLongitude, position, setPosition, clearRoutes, addBookmark }) => {
  //const [position, setPosition] = useState([48.150901, 11.571602]);
  const markerRef = useRef(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        setPosition([newPos.lat, newPos.lng]);
        clearRoutes();
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
      icon={redIcon}
    >
      <Popup>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <b>Verschieb mich!</b><br />
        Latitude: {position[0]?.toFixed(6)}<br />
        Longitude: {position[1]?.toFixed(6)}<br />
        <button 
          onClick={() => addBookmark(position)}
          style={{
            ...bookmarkButtonStyle,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon f7="bookmark" size={20} color="blue" />
        </button>
        <div style={{ fontSize: '11px', color: '#1a73e8', marginTop: '4px', width: '100%' }}>
          Zu Favoriten
        </div>
      </div>
    </Popup>
    </Marker>
  );
};

const GPSDraggableMarker = ({ gpsPosition, setGpsPosition, clearRoutes }) => {
  const { gpsLocation } = useGPSLocation();
  const markerRef = useRef(null);

  useEffect(() => {
    if (gpsLocation) {
      setGpsPosition([gpsLocation.latitude, gpsLocation.longitude]);
    }
  }, [gpsLocation]);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        setGpsPosition([newPos.lat, newPos.lng]);
        clearRoutes(); 
      }
    },
  };

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={gpsPosition}
      ref={markerRef}
    >
      <Popup>
        <b>GPS Marker</b><br />
        Latitude: {gpsPosition[0].toFixed(6)}<br />
        Longitude: {gpsPosition[1].toFixed(6)}
      </Popup>
    </Marker>
  );
};

const MapView = forwardRef(({ latitude, longitude, setLatitude, setLongitude, setRouteDistance, setStraightLineDistance }, ref) => {
  const [gpsPosition, setGpsPosition] = useState([47.666873, 9.444825]);
  const [markerPosition, setMarkerPosition] = useState([48.150901, 11.571602]);
  const [routeCoords, setRouteCoords] = useState([]);
  const [straightLineCoords, setStraightLineCoords] = useState([]);

  const [bookmarks, setBookmarks] = useState(() => {
  const stored = localStorage.getItem('bookmarks');
  return stored ? JSON.parse(stored) : [];
  });

  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);
  //console.log('Latitude:', latitude, 'Longitude:', longitude);

  function clearRoutes() {
    setRouteCoords([]);
    setStraightLineCoords([]);
  }

  function addBookmark(pos) {
    console.log('Favoriten position:', pos);
    if (!pos) return;
    const newBookmark = {
      lat: pos[0],
      lng: pos[1],
      name: `Ort ${bookmarks.length + 1}`,
    };
    const updated = [...bookmarks, newBookmark];
    setBookmarks(updated);
    localStorage.setItem('bookmarks', JSON.stringify(updated));
  }

  function goToBookmark(index) {
    const bm = bookmarks[index];
    if (!bm) return;
    const { lat, lng } = bm;
    setMarkerPosition([lat, lng]);
  }

  useImperativeHandle(ref, () => ({
    calculateRoute,
    refreshGPS,
    addBookmark,
    getBookmarks: () => bookmarks,
    goToBookmark,
    deleteBookmark: (index) => {
    const updated = bookmarks.filter((_, i) => i !== index);
    setBookmarks(updated);
    localStorage.setItem('bookmarks', JSON.stringify(updated));
  },
  }));

  // Hilfsfunktion: Luftlinien-Entfernung berechnen
  function calculateStraightLineDistance(pos1, pos2) {
    const toRad = (value) => (value * Math.PI) / 180;

    const [lat1, lon1] = pos1;
    const [lat2, lon2] = pos2;

    const R = 6371; // Radius der Erde in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async function calculateRoute() {
    const apiKey = '5b3ce3597851110001cf62485a5ab427aa2b4912b22184def3d18af0';
    const url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';

    const body = {
      coordinates: [
        [gpsPosition[1], gpsPosition[0]], 
        [markerPosition[1], markerPosition[0]]
      ]
    };

    console.log('Request-Body für OpenRouteService:', JSON.stringify(body, null, 2));


    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Routing API Fehler:', data);
        throw new Error(data.error?.message || 'Fehler bei der Anfrage');
      }

      const coords = data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
      setRouteCoords(coords);

      const distanceInKm = data.features[0].properties.summary.distance / 1000;
      setRouteCoords(coords);
      setRouteDistance(distanceInKm);

      

      // Luftlinie
      const luftlinieKm = calculateStraightLineDistance(gpsPosition, markerPosition);
      setStraightLineCoords([gpsPosition, markerPosition]);
      setStraightLineDistance(luftlinieKm); 

    } catch (error) {
      console.error('Fehler beim Routenberechnen:', error.message);
      //alert('Keine KFZ-Route gefunden!');

      setRouteCoords([]);
      const luftlinieKm = calculateStraightLineDistance(gpsPosition, markerPosition);
      setStraightLineCoords([gpsPosition, markerPosition]);
      setRouteDistance(null); // keine Route
      setStraightLineDistance(luftlinieKm);
    }
  }

  // reload gps data of user (for current position button)
  function refreshGPS() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsPosition([latitude, longitude]);
        console.log("GPS refreshed:", latitude, longitude);
      },
      (err) => {
        console.error('Fehler beim Aktualisieren der GPS-Position:', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  } else {
    console.error('Geolocation wird nicht unterstützt.');
  }
  }

  useEffect(() => {
    if (latitude) {
      setLat(latitude);
    }
    if (longitude) {
      setLong(longitude);
    }
  }, [latitude, longitude]); // <-- immer neu suchen, wenn sich die query ändert!
  

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      <MapContainer bounds={[markerPosition, gpsPosition]} zoom={13} scrollWheelZoom={true} style={{ height: '100vh', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GPSDraggableMarker gpsPosition={gpsPosition} setGpsPosition={setGpsPosition} clearRoutes={clearRoutes} />
        <DraggableMarker setLatitude={setLatitude} setLongitude={setLongitude} position={markerPosition} setPosition={setMarkerPosition} clearRoutes={clearRoutes} addBookmark={addBookmark}/>

        {/* KFZ-Route als blaue Linie */}
        {routeCoords.length > 0 && (
          <Polyline positions={routeCoords} color="blue" />
        )}

        {/* Luftlinie als rote Linie */}
        {straightLineCoords.length === 2 && (
          <Polyline positions={straightLineCoords} color="red" dashArray="5,10" />
        )}
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
        userSelect: 'none',          // verhindert Text- oder Bildauswahl
      }}>
        <CompassSVG />
      </div>
    </div>
  );
});

export default MapView;

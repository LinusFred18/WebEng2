import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import useGPSLocation from './gps';
import CompassSVG from '../components/compass';
import LocationSearch from './locationSearch';
import MapAutoFit from './mapAutofit';

// Marker-Icons fixen
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

const DraggableMarker = ({ setLatitude, setLongitude, position, setPosition, clearRoutes, setDestinationSelected, onManualDrag }) => {
  const markerRef = useRef(null);
  const [wikipediaSnippet, setWikipediaSnippet] = useState('');
  const [wikipediaUrl, setWikipediaUrl] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const query = "Friedrichshafen"; // Standardwert für die Abfrage, falls keine Position gesetzt ist	

 useEffect(() => {
    if (position[0] != null && position[1] != null) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.address) {
            const query = data.address.city || data.address.town || data.address.village || data.address.suburb;
            fetchWikiData(query);
          } else {
            console.error('Adresse nicht gefunden:', data);
          }
        })
        .catch((err) => {
          console.error('Fehler bei der Adressabfrage:', err);
        });
    }
  }, [position]);





  const fetchWikiData = async (searchTerm) => {
    if (!searchTerm) return;

    const url = `https://de.wikipedia.org/w/api.php?origin=*&action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data?.query?.search?.length > 0) {
        const item = data.query.search[0];
        setWikipediaSnippet(item.snippet);
        setWikipediaUrl(`https://de.wikipedia.org/?curid=${item.pageid}`);
      }
    } catch (err) {
      console.error('Fehler beim Abrufen der Wikipedia-Daten:', err);
    }
  };

  useEffect(() => {
    fetchWikiData(query);
  }, [query]);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        setPosition([newPos.lat, newPos.lng]);
        clearRoutes();
        setLatitude(newPos.lat);
        setLongitude(newPos.lng);
        setDestinationSelected(true);
        if (onManualDrag) onManualDrag();
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
      <Popup maxWidth={250} 
      height = {100}
      width = {100}
      >
        <div>
          <strong>Wikipedia-Auszug:</strong>
          <p
            dangerouslySetInnerHTML={{
              __html: isExpanded
                ? wikipediaSnippet
                : `${wikipediaSnippet.slice(0, 100)}...`,
            }}
          />
          <button onClick={() => setIsExpanded(!isExpanded)} style={{ marginTop: '0.5rem' }}>
            {isExpanded ? 'Weniger anzeigen' : 'Mehr anzeigen'}
          </button>
          {wikipediaUrl && (
            <div style={{ marginTop: '0.5rem' }}>
              <a href={wikipediaUrl} target="_blank" rel="noopener noreferrer">
                Zum Artikel
              </a>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
};


const GPSDraggableMarker = ({ gpsPosition, setGpsPosition, clearRoutes, setGpsReady, calculateRoute, destinationSelected, setDestinationSelected }) => {
  const { gpsLocation } = useGPSLocation();
  const markerRef = useRef(null);

  useEffect(() => {
    if (gpsLocation) {
      setGpsPosition([gpsLocation.latitude, gpsLocation.longitude]);
      setGpsReady(true);
    }
  }, [gpsLocation]);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        setGpsPosition([newPos.lat, newPos.lng]);
        clearRoutes();
        setGpsReady(true);
        if (!destinationSelected) {
          setDestinationSelected(true);
        }
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
  const [gpsReady, setGpsReady] = useState(false);
  const [destinationSelected, setDestinationSelected] = useState(false);

  const locationSearchRef = useRef();

  function clearRoutes() {
    setRouteCoords([]);
    setStraightLineCoords([]);
  }

  useImperativeHandle(ref, () => ({
    calculateRoute
  }));

  useEffect(() => {
    if (destinationSelected) {
      calculateRoute();
    }
  }, [markerPosition, gpsPosition, destinationSelected]);

  function calculateStraightLineDistance(pos1, pos2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const [lat1, lon1] = pos1;
    const [lat2, lon2] = pos2;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
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
      if (!response.ok) throw new Error(data.error?.message || 'Fehler bei der Anfrage');

      const coords = data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
      const distanceInKm = data.features[0].properties.summary.distance / 1000;

      setRouteCoords(coords);
      setRouteDistance(distanceInKm);

      const luftlinieKm = calculateStraightLineDistance(gpsPosition, markerPosition);
      setStraightLineCoords([gpsPosition, markerPosition]);
      setStraightLineDistance(luftlinieKm);
    } catch (error) {
      console.error('Fehler beim Routenberechnen:', error.message);
      setRouteCoords([]);
      const luftlinieKm = calculateStraightLineDistance(gpsPosition, markerPosition);
      setStraightLineCoords([gpsPosition, markerPosition]);
      setRouteDistance(null);
      setStraightLineDistance(luftlinieKm);
    }
  }

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      <MapContainer bounds={[markerPosition, gpsPosition]} zoom={13} scrollWheelZoom={true} style={{ height: '100vh', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GPSDraggableMarker
          gpsPosition={gpsPosition}
          setGpsPosition={setGpsPosition}
          clearRoutes={clearRoutes}
          setGpsReady={setGpsReady}
          calculateRoute={calculateRoute}
          destinationSelected={destinationSelected}
          setDestinationSelected={setDestinationSelected}
        />
        <DraggableMarker
          setLatitude={setLatitude}
          setLongitude={setLongitude}
          position={markerPosition}
          setPosition={(pos) => {
            setMarkerPosition(pos);
            locationSearchRef.current?.clearSearchField(); // 🔁 Suchfeld leeren beim manuellen Verschieben
          }}
          clearRoutes={clearRoutes}
          setDestinationSelected={setDestinationSelected}
          onManualDrag={() => {
            locationSearchRef.current?.clearSearchField();
          }}
        />
        <LocationSearch
          ref={locationSearchRef}
          onSelect={({ lat, lon }) => {
            setMarkerPosition([lat, lon]);
            setLatitude(lat);
            setLongitude(lon);
            setDestinationSelected(true);
          }}
        />
        {routeCoords.length > 0 && <Polyline positions={routeCoords} color="blue" />}
        {straightLineCoords.length === 2 && <Polyline positions={straightLineCoords} color="red" dashArray="5,10" />}
        <MapAutoFit routeCoords={routeCoords} />
      </MapContainer>
      <div style={{ position: 'absolute', bottom: '6%', left: '2%', aspectRatio: '1', maxWidth: '5rem', maxHeight: '5rem', zIndex: 1000, pointerEvents: 'none', userSelect: 'none' }}>
        <CompassSVG />
      </div>
    </div>
  );
});

export default MapView;

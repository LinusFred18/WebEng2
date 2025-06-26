import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef, useState, forwardRef, useImperativeHandle,} from 'react';
import { Icon, f7 } from 'framework7-react';

import CompassSVG from './compass';
import LocationSearch from './locationSearch';
import MapAutoFit from './mapAutofit';
import { Button } from 'framework7-react';
import WikiFetcher from './WikipediaAPI';  
import TravelTime from './travelTime';
import DraggableMarker from './draggableMarker';
import GPSDraggableMarker from './GPSDraggableMarker';



// Standard-Marker-Icons fixen
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});


// Component to handle clicks on the map and pass the clicked coordinates to a callback
const MapClickHandler = ({ onClick }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onClick([lat, lng]);
    },
  });
  return null;
};

const MapView = forwardRef(({ latitude, longitude, setLatitude, setLongitude}, ref) => {
  const [gpsPosition, setGpsPosition] = useState([47.666873, 9.444825]);
  const [markerPosition, setMarkerPosition] = useState([48.150901, 11.571602]);
  const [routeCoords, setRouteCoords] = useState([]);
  const [straightLineCoords, setStraightLineCoords] = useState([]);
  const [gpsReady, setGpsReady] = useState(false);
  const [destinationSelected, setDestinationSelected] = useState(false);

  const [expandedInfo, setExpandedInfo] = useState(null); // Neu: Für das große Overlay

  const [bookmarks, setBookmarks] = useState(() => {
  const stored = localStorage.getItem('bookmarks');
  return stored ? JSON.parse(stored) : [];
  });

  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);
  const locationSearchRef = useRef();

  // travel time per means of transport
  const [travelTimes, setTravelTimes] = useState({car: null, bike: null, walk: null,});
  const [routeDistance, setRouteDistance] = useState(null);
  const [straightLineDistance, setStraightLineDistance] = useState(null);

  function clearRoutes() {
    setRouteCoords([]);
    setStraightLineCoords([]);
  }

  // add a place to bookmark list
  async function addBookmark(pos) {
    if (!pos) return;
    // check if chosen place is duplicate
    const isDuplicate = bookmarks.some(
    (bm) =>
      bm.lat.toFixed(5) === pos[0].toFixed(5) &&
      bm.lng.toFixed(5) === pos[1].toFixed(5)
  );

  if (isDuplicate) {
    //alert('Dieser Ort ist bereits als Favorit gespeichert.');
    return;
  }

    // get name of the place to display in bookmarks list
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos[0]}&lon=${pos[1]}`);
      const data = await response.json();

    // get road and city name
    const road = data.address?.road || '';
    const city = data.address?.city || '';

    // choose displayed name of the place depending on given information
    let placeName = '';
    if (road && city) {
      placeName = `${road}, ${city}`;
    } else if (road) {
      placeName = road;
    } else if (city) {
      placeName = city;
    } else if (data.address?.neighbourhood) {
      placeName = data.address.neighbourhood;
    } else if (data.address?.suburb) {
      placeName = data.address.suburb;
    } else if (data.display_name) {
      placeName = data.display_name;
    } else {
      placeName = `Ort ${bookmarks.length + 1}`;
    }

    const newBookmark = {
      lat: pos[0],
      lng: pos[1],
      name: placeName,
    };

    const updated = [...bookmarks, newBookmark];
    setBookmarks(updated);
    localStorage.setItem('bookmarks', JSON.stringify(updated));

    // event for updating bookmarks list
    window.dispatchEvent(new CustomEvent('bookmarksUpdated', { detail: updated }));
  } // fallback if reverse geocoding has failed
    catch (error) {
    const newBookmark = {
      lat: pos[0],
      lng: pos[1],
      name: `Ort ${bookmarks.length + 1}`,
    };
    const updated = [...bookmarks, newBookmark];
    setBookmarks(updated);
    localStorage.setItem('bookmarks', JSON.stringify(updated));
  }
  }

  // set marker to bookmarked place
  function goToBookmark(index) {
    const bm = bookmarks[index];
    if (!bm) return;
    const { lat, lng } = bm;
    setMarkerPosition([lat, lng]);
  }

  // Expose functions to parent components using the ref
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

  // Automatically recalculate route when positions or destination change
  useEffect(() => {
    if (destinationSelected) {
      calculateRoute();
    }
  }, [markerPosition, gpsPosition, destinationSelected]);

  // Calculates the straight-line (great-circle) distance between two coordinates using the Haversine formula
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

  // Main function to calculate the route using multiple travel profiles from OpenRouteService API
  async function calculateRoute() {
    const apiKey = '5b3ce3597851110001cf62485a5ab427aa2b4912b22184def3d18af0';
    const urlBase = 'https://api.openrouteservice.org/v2/directions/';
    const profiles = ['driving-car', 'cycling-regular', 'foot-walking'];
  
    // Create a request for each profile (car, bike, foot)
    const requests = profiles.map(profile => {
      const url = `${urlBase}${profile}/geojson`;
      const body = {
        coordinates: [
          [gpsPosition[1], gpsPosition[0]],
          [markerPosition[1], markerPosition[0]]
        ]
      };
      // Send POST request for each transport profile
      return fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }).then(res => {
        if (!res.ok) {
          // Explicitly reject on status 429 (rate limit)
          return res.json().then(data => Promise.reject({ status: res.status, profile, message: data }));
        }
        return res.json().then(data => ({ profile, data, ok: res.ok }));
      });
    });
  
    try {
      // Wait for all API responses
      const results = await Promise.all(requests);
  
      const times = {};

      // Parse results for each profile
      results.forEach(({ profile, data, ok }) => {
        if (!ok || !data?.features?.length) {
          console.warn(`Fehler bei Profil ${profile}`);
          return;
        }

        // extract time in minutes for each means of transport
        const duration = data.features[0].properties.summary.duration / 60; 
        if (profile === 'driving-car') times.car = duration;
        if (profile === 'cycling-regular') times.bike = duration;
        if (profile === 'foot-walking') times.walk = duration;

        if (profile === 'driving-car') {
          const coords = data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
          const distanceInKm = data.features[0].properties.summary.distance / 1000;
          setRouteCoords(coords);
          setRouteDistance(distanceInKm);
        }
      });

      setTravelTimes(times);
  
      // Set default route data to driving profile if available
      const autoRoute = results.find(r => r.profile === 'driving-car' && r.ok);
      if (autoRoute) {
        const coords = autoRoute.data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
        const distanceInKm = autoRoute.data.features[0].properties.summary.distance / 1000;
        setRouteCoords(coords);
        setRouteDistance(distanceInKm);
      }
  
      // Calculate and store straight-line distance (Luftlinie)
      const luftlinieKm = calculateStraightLineDistance(gpsPosition, markerPosition);
      setStraightLineCoords([gpsPosition, markerPosition]);
      setStraightLineDistance(luftlinieKm);
  
    } catch (error) {
      console.error('Fehler beim Routenberechnen:', error.message);

      // Show alert if API rate limit exceeded or network error
      if (error.status === 429 || error instanceof TypeError) {
        f7.dialog.alert(
          'API Calls für OpenRouteService sind erschöpft. Bitte versuchen Sie es später erneut.',
          'Fehler'
        );
      }
      // Fallback to straight-line only
      setRouteCoords([]);
      const luftlinieKm = calculateStraightLineDistance(gpsPosition, markerPosition);
      setStraightLineCoords([gpsPosition, markerPosition]);
      setRouteDistance(null);
      setStraightLineDistance(luftlinieKm);
    }
  }

  // Overlay close
  function closeOverlay() {
    setExpandedInfo(null);
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
        f7.dialog.alert('Fehler beim Aktualisieren der GPS-Position');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  } else {
    console.error('Geolocation wird nicht unterstützt.');
    f7.dialog.alert('Geolocation wird nicht unterstützt.');
  }
  }

  useEffect(() => {
    if (latitude) {
      setLat(latitude);
    }
    if (longitude) {
      setLong(longitude);
    }
  }, [latitude, longitude]);


  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <MapContainer
        bounds={[markerPosition, gpsPosition]}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ position: 'relative', height: '100dvh', width: '100%' }}
      >
        <MapClickHandler
          onClick={(latlng) => {
            setMarkerPosition(latlng);
            setLatitude(latlng[0]);
            setLongitude(latlng[1]);
            setDestinationSelected(true);
            locationSearchRef.current?.clearSearchField();
            clearRoutes();
          }}
        />
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
            locationSearchRef.current?.clearSearchField();
          }}
          clearRoutes={clearRoutes}
          addBookmark={addBookmark}
          bookmarks={bookmarks}
          setDestinationSelected={setDestinationSelected}
          onManualDrag={() => {
            locationSearchRef.current?.clearSearchField();
          }}
          onExpandRequest={setExpandedInfo}
        />
        {routeCoords.length > 0 && (
          <Polyline positions={routeCoords} color="blue" weight={4} />
        )}
        {straightLineCoords.length > 0 && (
          <Polyline positions={straightLineCoords} color="red" dashArray="5, 10" />
        )}
        <MapAutoFit routeCoords={routeCoords} />
      </MapContainer>
      <div style={{
        position: 'absolute',
        width: '80%',
        top: '1rem',
        left: '10%',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'top',
        textAlign: 'center',
        pointerEvents: 'none',
        userSelect: 'none'
      }}>
        <TravelTime 
          travelTimes={travelTimes}
          routeDistance={routeDistance}
          straightLineDistance={straightLineDistance}
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
      </div>
      <CompassSVG/>

      {/* Bigger overlay for more informations */}
      {expandedInfo && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '80vw',
            height: '80vh',
            padding: '2rem',
            boxShadow: '0 0 15px rgba(0,0,0,0.3)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <a
              onClick={closeOverlay}
              style={{
                position: 'absolute',
                top: '-0.4rem',
                right: '0.25rem',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#333',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              ×
            </a>
            <h1 className="text-align-center">Wikipedia-Ergebnisse für „{expandedInfo.title}“</h1>
            <div style={{
              overflowY: 'auto',
              flex: 1,
              marginTop: '1rem',
            }}>
            <WikiFetcher query={expandedInfo.title} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default MapView;

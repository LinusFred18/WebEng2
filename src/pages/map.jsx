import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef, useState, forwardRef, useImperativeHandle,} from 'react';
import { Icon, f7 } from 'framework7-react';
import useGPSLocation from './gps';
import CompassSVG from '../components/compass';
import LocationSearch from './locationSearch';
import MapAutoFit from './mapAutofit';


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


// draggable destination marker
const DraggableMarker = ({ setLatitude, setLongitude, position, setPosition, clearRoutes, addBookmark, bookmarks, setDestinationSelected, onManualDrag, onExpandRequest}) => {
  const markerRef = useRef(null);
  const [wikipediaSnippet, setWikipediaSnippet] = useState('');
  const [wikipediaUrl, setWikipediaUrl] = useState('');
  
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

  const isBookmarked = bookmarks.some(
    (bm) =>
      Math.abs(bm.lat - position[0]) < 0.00001 &&
      Math.abs(bm.lng - position[1]) < 0.00001
  );

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
      <Popup>
        <div style={{ width: '250px' }}>
          <strong>Wikipedia-Auszug:</strong>
          <p
            dangerouslySetInnerHTML={{
              __html: `${wikipediaSnippet.slice(0, 100)}...`
            }}
          />
          <button
            onClick={() => onExpandRequest({
              snippet: wikipediaSnippet,
              url: wikipediaUrl,
              position,
            })}
            style={{ marginTop: '0.5rem' }}
          >
            Mehr anzeigen
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
      /*
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
          {/* filled bookmark if already saved and not filled if not saved*/}
            <Icon
              f7={isBookmarked ? 'bookmark_fill' : 'bookmark'}
              size={20}
              color={isBookmarked ? 'blue' : 'gray'}
            />
        </button>
        <div style={{ fontSize: '11px', color: '#1a73e8', marginTop: '4px', width: '100%' }}>
          Zu Favoriten
        </div>
      </div>
    </Popup>
    */
    </Marker>
  );
};


// draggable start point (gps) marker
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

const MapClickHandler = ({ onClick }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onClick([lat, lng]);
    },
  });
  return null;
};

const MapView = forwardRef(({ latitude, longitude, setLatitude, setLongitude, setRouteDistance, setStraightLineDistance }, ref) => {
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
  //console.log('Latitude:', latitude, 'Longitude:', longitude);
  const locationSearchRef = useRef();

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
    const urlBase = 'https://api.openrouteservice.org/v2/directions/';
    const profiles = ['driving-car', 'cycling-regular', 'foot-walking'];
  
    const requests = profiles.map(profile => {
      const url = `${urlBase}${profile}/geojson`;
      const body = {
        coordinates: [
          [gpsPosition[1], gpsPosition[0]],
          [markerPosition[1], markerPosition[0]]
        ]
      };
      return fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }).then(res => res.json().then(data => ({ profile, data, ok: res.ok })));
    });
  
    try {
      const results = await Promise.all(requests);
  
      results.forEach(({ profile, data, ok }) => {
        if (!ok) {
          console.warn(`Fehler bei Profil ${profile}:`, data.error?.message || 'Unbekannter Fehler');
          return;
        }
        const distance = data.features[0].properties.summary.distance / 1000; // km
        const duration = data.features[0].properties.summary.duration / 60;   // Minuten
  
        console.log(`Profil: ${profile}`);
        console.log(`- Strecke: ${distance.toFixed(2)} km`);
        console.log(`- Zeit: ${duration.toFixed(1)} Minuten`);
      });
  
      const autoRoute = results.find(r => r.profile === 'driving-car' && r.ok);
      if (autoRoute) {
        const coords = autoRoute.data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
        const distanceInKm = autoRoute.data.features[0].properties.summary.distance / 1000;
        setRouteCoords(coords);
        setRouteDistance(distanceInKm);
      }
  
      // Gerade Linie
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

  // Overlay schließen
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
  }, [latitude, longitude]); // <-- immer neu suchen, wenn sich die query ändert!


  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      <MapContainer
        bounds={[markerPosition, gpsPosition]}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ height: '100vh', width: '100%' }}
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
          <Polyline positions={straightLineCoords} color="green" dashArray="5, 10" />
        )}
        <MapAutoFit positions={[gpsPosition, markerPosition]} />
      </MapContainer>

      <LocationSearch
        ref={locationSearchRef}
        setLatitude={setLatitude}
        setLongitude={setLongitude}
        clearRoutes={clearRoutes}
        setDestinationSelected={setDestinationSelected}
        setPosition={setMarkerPosition}
      />
      <CompassSVG position={markerPosition} />

      {/* Großes Overlay für mehr Infos */}
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
          overflowY: 'auto',
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '80vw',
            height: '80vh',
            padding: '2rem',
            boxShadow: '0 0 15px rgba(0,0,0,0.3)',
            overflowY: 'auto',
          }}>
            <h2>Wikipedia Auszug (Erweitert)</h2>
            <div dangerouslySetInnerHTML={{ __html: expandedInfo.snippet }} />
            {expandedInfo.url && (
              <p>
                <a href={expandedInfo.url} target="_blank" rel="noopener noreferrer">
                  Zum Artikel auf Wikipedia
                </a>
              </p>
            )}
            <button onClick={closeOverlay} style={{ marginTop: '1rem' }}>
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default MapView;

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef, useState, forwardRef, useImperativeHandle,} from 'react';
import { Icon, f7 } from 'framework7-react';
import { Button } from 'framework7-react';

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

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// A draggable map marker that fetches location data and shows a Wikipedia snippet in a popup
const DraggableMarker = ({ setLatitude, setLongitude, position, setPosition, clearRoutes, addBookmark, bookmarks, setDestinationSelected, onManualDrag, onExpandRequest}) => {
  const markerRef = useRef(null);
  const [wikipediaSnippet, setWikipediaSnippet] = useState('');
  const [wikipediaUrl, setWikipediaUrl] = useState('');
  const [locationX, setLocationX] = useState('');
  
  // Default query if no reverse geolocation is available
  const query = "Friedrichshafen"; 	

  // Fetch reverse geolocation and Wikipedia data when the position changes
  useEffect(() => {
    if (position[0] != null && position[1] != null) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.address) {
            // Determine the most specific available location name
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
    const address2 = searchTerm;
    const url = `https://de.wikipedia.org/w/api.php?origin=*&action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data?.query?.search?.length > 0) {
        const item = data.query.search[0];
        setWikipediaSnippet(item.snippet);
        setLocationX(item.title);
        setWikipediaUrl(`https://de.wikipedia.org/?curid=${item.pageid}`);
      }
    } catch (err) {
      console.error('Fehler beim Abrufen der Wikipedia-Daten:', err);
    }
  };

  useEffect(() => {
    fetchWikiData(query);
  }, [query]);

  // Check if current position is already bookmarked
  const isBookmarked = bookmarks.some(
    (bm) =>
      Math.abs(bm.lat - position[0]) < 0.00001 &&
      Math.abs(bm.lng - position[1]) < 0.00001
  );

  // Handler when the user finishes dragging the marker
  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        setPosition([newPos.lat, newPos.lng]);
        clearRoutes(); // Clear any existing routes
        setLatitude(newPos.lat);
        setLongitude(newPos.lng);
        setDestinationSelected(true); // Mark destination as selected
        if (onManualDrag) onManualDrag(); // Optional callback
        marker.openPopup();
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
        <div style={{ width: '250px'}}>
          <strong>Wikipedia-Auszug: {locationX}</strong>
          <p
            dangerouslySetInnerHTML={{
              __html: `${wikipediaSnippet.slice(0, 1000)}...`
            }}
          />
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', textAlign: 'center' }}>
            <Button
              fill
              small
              style={{
                marginTop: '8px',
                backgroundColor: '#1a73e8',
                color: 'white',
                width: '80%'
              }}
              onClick={() => onExpandRequest({
                snippet: wikipediaSnippet,
                url: wikipediaUrl,
                title: locationX,
                position,
              })}
            >
              Mehr anzeigen
            </Button>
            <button 
              onClick={() => addBookmark(position)}
              style={{
                ...bookmarkButtonStyle,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: '1em'
              }}
            >
              <Icon
                f7={isBookmarked ? 'bookmark_fill' : 'bookmark'}
                size={20}
                color={isBookmarked ? 'blue' : 'gray'}
              />
            </button>
          </div>
        </div>
      

          {/*<div style={{ fontSize: '11px', color: '#1a73e8', marginTop: '4px', width: '100%' }}>
            Zu Favoriten
          </div>*/}
      </Popup>
    </Marker>
  );
};

export default DraggableMarker;

import { useState, useRef } from 'react';
import {
  Page,
  Block,
  BlockTitle,
  Button,
  Icon
} from 'framework7-react';

import ReverseGeocoding from './reverseGeocoding';
import MapView from './map';
import WikiFetcher from '../components/WikipediaAPI';
//import coordinatesIcon from './icons/icons8-address-100.png';
//import routeIcon from 'public/icons/icons8-address-100.png';

const HomePage = () => {
  const [addressData, setAddressData] = useState(null);
  // gps coordinates of user
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  
  // distance information of route
  const [routeDistance, setRouteDistance] = useState(null);
  const [straightLineDistance, setStraightLineDistance] = useState(null);


  // destination gps coordinates
  const [latitude2, setLatitude2] = useState(null);
  const [longitude2, setLongitude2] = useState(null);

  const [panelHeight, setPanelHeight] = useState(120); // Start klein
  const [isExpanded, setIsExpanded] = useState(false);

  const [showCoordinates, setShowCoordinates] = useState(true);

  const toggleContent = () => {
    setShowCoordinates(!showCoordinates);
  };

  const panelRef = useRef(null);
  const touchData = useRef({
    startY: null,
    startHeight: null,
  });
  const mapRef = useRef();

  const MIN_HEIGHT = 120; // Panel Minimum

  const handleRouteCalculation = () => {
    if (mapRef.current) {
      mapRef.current.calculateRoute(); 
    }
  };

  const handleTouchStart = (e) => {
    touchData.current.startY = e.touches[0].clientY;
    touchData.current.startHeight = panelHeight;
  };

  const handleTouchMove = (e) => {
    if (touchData.current.startY === null) return;
    const currentY = e.touches[0].clientY;
    const diff = touchData.current.startY - currentY;
    const windowHeight = window.innerHeight; // Immer live lesen
    const maxHeight = windowHeight * 0.9;

    let newHeight = touchData.current.startHeight + diff;
    newHeight = Math.max(MIN_HEIGHT, Math.min(maxHeight, newHeight));

    setPanelHeight(newHeight);
  };

  const handleTouchEnd = () => {
    const windowHeight = window.innerHeight;
    const snapPoint = windowHeight * 0.5;

    if (panelHeight > snapPoint) {
      setPanelHeight(windowHeight * 0.9); // Hochklappen
      setIsExpanded(true);
    } else {
      setPanelHeight(MIN_HEIGHT); // Runterklappen
      setIsExpanded(false);
    }

    touchData.current.startY = null;
    touchData.current.startHeight = null;
  };

  const handleCollapse = () => {
    setPanelHeight(MIN_HEIGHT);
    setIsExpanded(false);
  };

  return (
    <Page name="home">

      {/* Karte */}
      <MapView
        latitude={latitude}
        longitude={longitude}
        setLatitude={setLatitude2}
        setLongitude={setLongitude2}
        ref={mapRef}
        setRouteDistance={setRouteDistance}
        setStraightLineDistance={setStraightLineDistance}
      />

      <Button fill onClick={handleRouteCalculation} style={{ margin: '1em' }}>
        Route berechnen
      </Button>

      {/* Reverse Geocoding */}
      <ReverseGeocoding
        setAddressData={setAddressData}
        setLatitude={setLatitude}
        setLongitude={setLongitude}
        latitude2={latitude2}
        longitude2={longitude2}
      />

      {/* Adresse */}
      <Block strong>
        Straße: {addressData?.road || 'Warte auf Adresse...'}
      </Block>

      {/* --- Fixiertes Panel unten --- */}
      <div
        ref={panelRef}
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          height: `${panelHeight}px`,
          background: '#fff',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          boxShadow: '0px -2px 10px rgba(0,0,0,0.1)',
          transition: touchData.current.startY === null ? 'height 0.3s' : 'none',
          overflow: isExpanded ? 'auto' : 'hidden',
          touchAction: 'none',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Griff */}
        <div
          onClick={isExpanded ? handleCollapse : undefined}
          style={{
            width: '40px',
            height: '5px',
            background: '#ccc',
            borderRadius: '4px',
            margin: '10px auto',
            cursor: 'pointer',
          }}
        />

        {/* Panel Inhalt */}
        <div style={{
          flex: 1,
          overflowY: isExpanded ? 'auto' : 'hidden',
          padding: '0 16px',
        }}>

        {/* button to switch between contents to be shown */}
        <div>
        <BlockTitle>Hier Button</BlockTitle>
        <div style={{ display: 'flex', width: 'auto', justifyContent: 'space-between' }}>
        <div>
        {showCoordinates ? (
          // display coordinates
          <div>
            <p style={{ flexShrink: 1, width: 'fit-content' }}>Start:<br />{latitude}<br />{longitude}</p>
            <p style={{ flexShrink: 1, width: 'fit-content' }}>Ziel:<br />{latitude2}<br />{longitude2}</p>
          </div>
        ) : (
          // display distance information
          <div>
            <p>Luftlinie: {straightLineDistance ? `${straightLineDistance.toFixed(2)} km` : '–'}</p>
            <p>Route: {routeDistance !== null ? `${routeDistance.toFixed(2)} km` : '–'}</p>
          </div>
        )}

        </div>
        <Button small style={{ width: '20vw', height: '10vw', float: 'right', backgroundColor: '#cce7ff',  
                               border: '2px solid #66a3e0', borderRadius: '10px',}} onClick={toggleContent}>
          <img
            src={showCoordinates ? '/icons/route2.png' : '/icons/location3.png'}
            alt="Toggle View"
            style={{ width: '7vw', height: '7vw' }}
          />
        </Button>
        </div>
        </div>
        
          <BlockTitle>Wikipedia Informationen</BlockTitle>
          <WikiFetcher query={addressData} />
        </div>
      </div>

    </Page>
  );
};

export default HomePage;

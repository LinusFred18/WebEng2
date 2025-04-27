import { useState, useRef } from 'react';
import {
  Page,
  Block,
  BlockTitle,
} from 'framework7-react';

import ReverseGeocoding from './reverseGeocoding';
import MapView from './map';
import WikiFetcher from '../components/WikipediaAPI';

const HomePage = () => {
  const [addressData, setAddressData] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [latitude2, setLatitude2] = useState(null);
  const [longitude2, setLongitude2] = useState(null);

  const [panelHeight, setPanelHeight] = useState(120); // Start klein
  const [isExpanded, setIsExpanded] = useState(false);

  const panelRef = useRef(null);
  const touchData = useRef({
    startY: null,
    startHeight: null,
  });

  const MIN_HEIGHT = 120; // Panel Minimum

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
      />

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
          <BlockTitle>Wikipedia Informationen</BlockTitle>
          <WikiFetcher query={addressData} />
        </div>
      </div>

    </Page>
  );
};

export default HomePage;

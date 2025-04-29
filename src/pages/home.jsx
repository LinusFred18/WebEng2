import { useState, useRef, useEffect } from 'react';
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

  const [panelHeight, setPanelHeight] = useState(120);
  const panelRef = useRef(null);
  const dragInfo = useRef({
    startY: null,
    startHeight: null,
    isDragging: false,
  });

  const MIN_HEIGHT = 120;
  const MAX_HEIGHT = window.innerHeight * 0.9;

  const startDrag = (y) => {
    dragInfo.current.startY = y;
    dragInfo.current.startHeight = panelHeight;
    dragInfo.current.isDragging = true;
  };

  const doDrag = (y) => {
    if (!dragInfo.current.isDragging) return;

    const diff = dragInfo.current.startY - y;
    let newHeight = dragInfo.current.startHeight + diff;
    newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight));
    setPanelHeight(newHeight);
  };

  const stopDrag = () => {
    dragInfo.current.startY = null;
    dragInfo.current.startHeight = null;
    dragInfo.current.isDragging = false;
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragInfo.current.isDragging) {
        doDrag(e.clientY);
      }
    };
    const handleMouseUp = () => {
      if (dragInfo.current.isDragging) {
        stopDrag();
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleTouchStart = (e) => startDrag(e.touches[0].clientY);
  const handleTouchMove = (e) => {
    if (dragInfo.current.isDragging) {
      doDrag(e.touches[0].clientY);
    }
  };
  const handleTouchEnd = () => stopDrag();

  return (
    <Page name="home">
      <MapView
        latitude={latitude}
        longitude={longitude}
        setLatitude={setLatitude2}
        setLongitude={setLongitude2}
      />
      <ReverseGeocoding
        setAddressData={setAddressData}
        setLatitude={setLatitude}
        setLongitude={setLongitude}
        latitude2={latitude2}
        longitude2={longitude2}
      />
      <Block strong>
        Straße: {addressData?.road || 'Warte auf Adresse...'}
      </Block>

      {/* Bottom Panel */}
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
          transition: dragInfo.current.isDragging ? 'none' : 'height 0.2s',
          overflow: 'hidden',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Ziehgriff (Drag-Zone) */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={(e) => startDrag(e.clientY)}
          style={{
            height: '20px',
            width: '100%',
            cursor: 'grab',
            touchAction: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{
            width: '40px',
            height: '5px',
            background: '#ccc',
            borderRadius: '4px',
          }} />
        </div>

        {/* Scrollbarer Inhalt */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 16px',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <BlockTitle>Wikipedia Informationen</BlockTitle>
          <WikiFetcher query={addressData} />
        </div>
      </div>
    </Page>
  );
};

export default HomePage;

import React, { useState, useEffect, useRef } from 'react';
import { Button, Icon } from 'framework7-react';


const FadeInMenu = ({mapRef}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const containerRef = useRef(null);

  // opening and closing of menu
  const toggleMenu = () => {setMenuOpen((prev) => 
    {const newState = !prev;
      if (!newState){
        setShowBookmarks(false);
      }
      return newState;
    });
  };

  // show the current bookmarks list
  useEffect(() => {
    if (showBookmarks && mapRef?.current?.getBookmarks) {
      const bms = mapRef.current.getBookmarks();
      setBookmarks(bms || []);
    }
    }, [showBookmarks, mapRef]);

  useEffect(() => {
  const handleBookmarksUpdate = (e) => {
    setBookmarks(e.detail || []);
  };

  window.addEventListener('bookmarksUpdated', handleBookmarksUpdate);
  return () => window.removeEventListener('bookmarksUpdated', handleBookmarksUpdate);
  }, []);

    // set the marker to the bookmarked place by clicking on it in the list
    const onBookmarkClick = (index) => {
      if (mapRef?.current?.goToBookmark) {
        mapRef.current.goToBookmark(index);     
      }
    };

    // deletion of bookmarks
    const deleteBookmark = (index) => {
      if (mapRef?.current?.deleteBookmark) {
        mapRef.current.deleteBookmark(index);
        const updated = [...bookmarks];
        updated.splice(index, 1);
        setBookmarks(updated);
      }
    };


  const StyledButton = ({ icon, label, onClick, delay, menuOpen }) => {
  // fade in menu style
  const containerStyle = {
    transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
    opacity: menuOpen ? 1 : 0,
    pointerEvents: menuOpen ? 'auto' : 'none',
    transition: `transform 0.3s ease ${delay}s, opacity 0.3s ease ${delay}s`,
    margin: '8px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  // feature buttons style
  const iconButtonStyle = {
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
  };

  // label text style under buttons
  const labelStyle = {
    fontSize: '11px',
    color: '#1a73e8',
    marginTop: '4px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={containerStyle}>
      <Button style={iconButtonStyle} onClick={onClick}>
        <Icon f7={icon} size={24} color="primary" />
      </Button>
      {label && <div style={labelStyle}>{label}</div>}
    </div>
  );
  };


  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        right: 'clamp(1rem, 3vw, 2rem)',
        bottom: '30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '60px',
        zIndex: 1000,
      }}
    >
      {/* Bookmarks list popup */}
      {showBookmarks && (
        <div
          style={{
            position: 'absolute',
            bottom: '110px',
            right: '130%',
            width: '200px',
            maxHeight: '300px',
            overflowY: 'auto',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            zIndex: 1001,
            padding: '8px',
          }}
        >
          <b>Favoriten</b>
          {bookmarks.length === 0 && <div>Keine Favoriten gespeichert.</div>}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {bookmarks.map((bm, idx) => (
              <li
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 8px',
                borderBottom: '1px solid #eee',
              }}
            >
              <div onClick={() => onBookmarkClick(idx)} style={{ cursor: 'pointer' }}>
                {bm.name}
                <br />
                <small style={{ color: '#666' }}>
                  {bm.lat.toFixed(5)}, {bm.lng.toFixed(5)}
                </small>
              </div>
              <Button
                small
                clear
                onClick={() => deleteBookmark(idx)}
                style={{ marginLeft: '8px' }}
              >
                <Icon f7="trash" size={16} color="red" />
              </Button>
            </li>
            ))}
          </ul>
          <Button
            fill
            small
            style={{ marginTop: '8px' }}
            onClick={() => setShowBookmarks(false)}
          >
            Schließen
          </Button>
        </div>
      )}

      {/* Menu */}
      <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '10px',
        padding: '12px 16px',
        position: 'absolute',
        bottom: '50px',
        left: '50%',
        transform: menuOpen
          ? 'translateX(-50%) translateX(0)'
          : 'translateX(-50%) translateX(100%)',
        opacity: menuOpen ? 1 : 0,
        borderRadius: '10px',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        pointerEvents: menuOpen ? 'auto' : 'none',
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        zIndex: 1001,
      }}
    >

        <StyledButton
          icon="bookmark"
          label="Favoriten"
          delay={0}
          menuOpen={menuOpen}
          onClick={() => setShowBookmarks(true)}
        />

        {/* Reload current GPS position*/}
        <StyledButton
          icon="map_pin_ellipse"
          label="Standort"
          delay={0.05}
          menuOpen={menuOpen}
          onClick={() => mapRef?.current?.refreshGPS()}
        />
      </div>

      {/* Hamburger Button */}
      <Button
        round
        fill
        onClick={toggleMenu}
        style={{
          width: '100%',
          height: '50px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '10px',
          marginTop: '10px',
          position: 'relative',
          border: menuOpen ? '1px solid #ccc' : 'none',
          backgroundColor: menuOpen ? 'white' : undefined,
          boxShadow: menuOpen ? '0 2px 10px rgba(0,0,0,0.1)' : 'none',
          transition: 'all 0.3s ease',
          zIndex: 1002,
        }}
      >
        <Icon f7={menuOpen ? 'xmark' : 'line_horizontal_3'} style={{transition: 'all 0.3s ease', transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: menuOpen ? '#085cc4' : 'white' }} />
      </Button>
    </div>
  );
};

export default FadeInMenu;

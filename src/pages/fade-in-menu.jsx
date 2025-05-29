import React, { useState, useEffect, useRef } from 'react';
import { Button, Icon } from 'framework7-react';

const FadeInMenu = ({mapRef}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef(null);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && containerRef.current && !containerRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const buttonStyle = (delay) => ({
    transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
    opacity: menuOpen ? 1 : 0,
    pointerEvents: menuOpen ? 'auto' : 'none',
    transition: `transform 0.3s ease ${delay}s, opacity 0.3s ease ${delay}s`,
    margin: '5px',
  });

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        right: '2em',
        bottom: '30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '60px',
        zIndex: 1000,
      }}
    >
      {/* Menü */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '10px',
          padding: '10px 0',
          position: 'absolute',
          bottom: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderRadius: '10px',
          backgroundColor: menuOpen ? 'white' : 'transparent',
          border: menuOpen ? '1px solid #ccc' : 'none',
          boxShadow: menuOpen ? '0 2px 10px rgba(0,0,0,0.1)' : 'none',
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'all 0.3s ease',
          zIndex: 1001,
        }}
      >
        <Button square small style={buttonStyle(0)} onClick={() => console.log('Button 1 gedrückt')}>
          <Icon f7="square" />
        </Button>
        {/* Reload current GPS position*/}
        <Button square small style={buttonStyle(0.05)} onClick={() => mapRef?.current?.refreshGPS()}>
          <Icon f7="map_pin_ellipse" />
        </Button>
        <Button square small style={buttonStyle(0.1)} onClick={() => console.log('Button 3 gedrückt')}>
          <Icon f7="star" />
        </Button>
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

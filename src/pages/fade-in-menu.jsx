import React, { useState, useEffect, useRef } from 'react';
import { Button, Icon } from 'framework7-react';


const FadeInMenu = ({mapRef}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef(null);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  {/*menu closes also when clicking somewhere on the map*/}
  {/*useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && containerRef.current && !containerRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);*/}

  const StyledButton = ({ icon, label, onClick, delay, menuOpen }) => {
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
        right: '3vw',
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
          onClick={() => console.log('Button 1 gedrückt')}
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

import { useEffect, useState } from 'react';

// get GPS location coordinates of user
const getLocation = () => {
  const [gpsLocation, setGPSPosition] = useState(null);
  const [geoError, setGeoError] = useState(null);

  useEffect(() => {
    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    const geoSuccess = (pos) => {
      const { latitude, longitude } = pos.coords;
      setGPSPosition({ latitude, longitude });
    };

    const geoError = (err) => {
        console.warn(`ERROR(${err.code}): ${err.message}`);
  
        let errorMessage = '';
  
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'PERMISSION_DENIED: Ohne Deine Positionsdaten können Aktivitäten Dir nicht oder nur ungenau zugeordnet werden.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'POSITION_UNAVAILABLE: Deine Positionsdaten können nicht ermittelt werden.';
            break;
          case err.TIMEOUT:
            errorMessage = 'TIMEOUT: Deine Positionsdaten konnten nicht rechtzeitig ermittelt werden.';
            break;
          default:
            errorMessage = 'UNKNOWN ERROR: Deine Positionsdaten konnten nicht ermittelt werden.';
            break;
        }
  
        setGeoError(errorMessage);
      };
  
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
      } else {
        setGeoError('Geolocation wird von diesem System/Device nicht unterstützt!');
      }
    }, []);


// test gps coordinates by printing in browser
  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h2>Standort</h2>
      {gpsLocation ? (
        <p>
          Latitude: {gpsLocation.latitude} <br />
          Longitude: {gpsLocation.longitude}
        </p>
      ) : geoError ? (
        <p style={{ color: 'red' }}>Fehler: {geoError}</p>
      ) : (
        <p>Lade Standortdaten...</p>
      )}
    </div>
  );
};

export default getLocation;
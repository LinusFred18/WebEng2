import { useEffect, useState } from 'react';

const GeoLocationWithReverse = ({ setAddressData }) => {
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

    const geoErrorHandler = (err) => {
      let errorMessage = '';

      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = 'Ohne deine Zustimmung kann der Standort nicht ermittelt werden.';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = 'Position konnte nicht ermittelt werden.';
          break;
        case err.TIMEOUT:
          errorMessage = 'Timeout bei Standortermittlung.';
          break;
        default:
          errorMessage = 'Unbekannter Fehler.';
          break;
      }

      setGeoError(errorMessage);
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(geoSuccess, geoErrorHandler, geoOptions);
    } else {
      setGeoError('Geolocation wird nicht unterstützt.');
    }
  }, []);

  useEffect(() => {
    if (gpsLocation) {
      const { latitude, longitude } = gpsLocation;
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        .then((res) => res.json())
        .then((data) => {
          if (setAddressData) {
            setAddressData(data.address);
          }
        })
        .catch((err) => {
          console.error("Fehler bei der Adressabfrage:", err);
        });
    }
  }, [gpsLocation, setAddressData]);

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h2>Standortdaten</h2>

      {geoError && <p style={{ color: 'red' }}>Fehler: {geoError}</p>}

      {gpsLocation && (
        <p>
          Latitude: {gpsLocation.latitude} <br />
          Longitude: {gpsLocation.longitude}
        </p>
      )}
    </div>
  );
};

export default GeoLocationWithReverse;

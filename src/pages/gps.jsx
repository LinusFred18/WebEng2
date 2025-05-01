import { useEffect, useState } from 'react';

const useGPSLocation = () => {
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
          errorMessage = 'PERMISSION_DENIED: Zugriff verweigert.';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = 'POSITION_UNAVAILABLE: Standort nicht verfügbar.';
          break;
        case err.TIMEOUT:
          errorMessage = 'TIMEOUT: Zeitüberschreitung.';
          break;
        default:
          errorMessage = 'UNKNOWN ERROR.';
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

  return { gpsLocation, geoError };
};

export default useGPSLocation;

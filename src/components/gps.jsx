import { useEffect, useState } from 'react';
import { f7 } from 'framework7-react';

const useGPSLocation = () => {
  const [gpsLocation, setGPSPosition] = useState(null);
  const [geoError, setGeoError] = useState(null);

  // settings for getting the gps position of the user
  useEffect(() => {
    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    // successful retrieval of the gps position
    const geoSuccess = (pos) => {
      const { latitude, longitude } = pos.coords;
      setGPSPosition({ latitude, longitude });
    };

    // error handling for unsuccessful retrieval of the gps position
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
      f7.dialog.alert(`${errorMessage}`);
    };

    // get gps position information if possible
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(geoSuccess, geoErrorHandler, geoOptions);
    } else {
      setGeoError('Geolocation wird nicht unterstützt.');
    }
  }, []);

  return { gpsLocation, geoError };
};

export default useGPSLocation;

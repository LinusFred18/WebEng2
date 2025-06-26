import { useEffect, useState } from 'react';

const GeoLocationWithReverse = ({ setAddressData, setLatitude, setLongitude, latitude2, longitude2 }) => {
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

    // get gps position information if possible
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(geoSuccess, geoErrorHandler, geoOptions);
    } else {
      setGeoError('Geolocation wird nicht unterstützt.');
    }
  }, []);

  // perform reverse geo coding if both coordinates are given
  useEffect(() => {
    if (gpsLocation) {
      const { latitude, longitude } = gpsLocation;
      setLatitude(latitude);
      setLongitude(longitude);

      if (latitude2 != null && longitude2 != null){
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude2}&lon=${longitude2}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.adress == null){
              data.adress = {road: "test"}
            }
            setAddressData(data.address.road);

          })
          .catch((err) => {
            console.error("Fehler bei der Adressabfrage:", err);
          });
      }
    }
  }, [gpsLocation, latitude2, longitude2]);;
};

export default GeoLocationWithReverse;

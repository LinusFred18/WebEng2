import { useEffect, useState } from 'react';

const GeoLocationWithReverse = ({ setAddressData, setLatitude, setLongitude, latitude2, longitude2 }) => {
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
      console.log("A:", latitude2, longitude2);
      setLatitude(latitude);
      setLongitude(longitude);

      if (latitude2 != null && longitude2 != null){
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude2}&lon=${longitude2}`)
          .then((res) => res.json())
          .then((data) => {
            console.log("C:", data.adress);
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
  }, [gpsLocation, latitude2, longitude2]);
  

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

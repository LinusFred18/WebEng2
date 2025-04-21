import { useEffect, useState } from 'react';

const GeoLocationWithReverse = () => {
  const [gpsLocation, setGPSPosition] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [addressData, setAddressData] = useState(null);

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
          setAddressData(data.address);
        })
        .catch((err) => {
          console.error("Fehler bei der Adressabfrage:", err);
        });
    }
  }, [gpsLocation]);

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

      {addressData ? (
        <div style={{ marginTop: '1rem' }}>
          <h3>Adresse laut Reverse Geocoding</h3>
          <table cellPadding="4" cellSpacing="2" style={{ backgroundColor: '#ccffff', width: '100%', maxWidth: '500px' }}>
            <tbody>
              {addressData.road && (
                <tr>
                  <td>Straße:</td>
                  <td>{addressData.road} {addressData.house_number ?? ''}</td>
                </tr>
              )}
              {addressData.postcode && (
                <tr>
                  <td>PLZ:</td>
                  <td>{addressData.postcode}</td>
                </tr>
              )}
              {addressData.city || addressData.town || addressData.village ? (
                <tr>
                  <td>Ort:</td>
                  <td>{addressData.city ?? addressData.town ?? addressData.village}</td>
                </tr>
              ) : null}
              {addressData.county && (
                <tr>
                  <td>Landkreis:</td>
                  <td>{addressData.county}</td>
                </tr>
              )}
              {addressData.state && (
                <tr>
                  <td>Bundesland:</td>
                  <td>{addressData.state}</td>
                </tr>
              )}
              {addressData.country && (
                <tr>
                  <td>Land:</td>
                  <td>{addressData.country} ({addressData.country_code})</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : gpsLocation && (
        <p>Lade Adressdaten …</p>
      )}
    </div>
  );
};

export default GeoLocationWithReverse;

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const MapAutoFit = ({ routeCoords }) => {
  const map = useMap();

  useEffect(() => {
    if (routeCoords && routeCoords.length > 0) {
      const bounds = routeCoords.map(coord => [coord[0], coord[1]]);
      map.fitBounds(bounds, { padding: [50, 50] }); // Padding sorgt dafür, dass Marker/Routen nicht am Rand kleben
    }
  }, [routeCoords, map]);

  return null;
};

export default MapAutoFit;

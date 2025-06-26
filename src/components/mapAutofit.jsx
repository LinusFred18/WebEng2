import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

// A helper component that automatically fits the map view to the provided route coordinates
const MapAutoFit = ({ routeCoords }) => {
  const map = useMap();

  useEffect(() => {
    if (routeCoords && routeCoords.length > 0) {
      const bounds = routeCoords.map(coord => [coord[0], coord[1]]);
      map.fitBounds(bounds, { padding: [50, 50] }); 
    }
  }, [routeCoords, map]);

  return null;
};

export default MapAutoFit;

import 'leaflet-routing-machine';
import L from 'leaflet';

const Route = (routeRef) => {
  const calculateRoute = () => {
    if (!routeRef || !routeRef.current) return;
    const { gpsPos, simplePos } = routeRef.current.getMarkers();

    if (!gpsPos || !simplePos) {
      console.error('Marker-Positionen fehlen!');
      return;
    }

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(gpsPos.lat, gpsPos.lng),
        L.latLng(simplePos.lat, simplePos.lng),
      ],
      createMarker: () => { return null; }, 
      lineOptions: {
        addWaypoints: false,
      },
      routeWhileDragging: false,
      show: false,
    });

    routingControl.on('routesfound', function (e) {
      console.log('Gefundene Route:', e.routes[0]);
      console.log('Distanz (m):', e.routes[0].summary.totalDistance);
      console.log('Dauer (s):', e.routes[0].summary.totalTime);
    });

    routingControl._router.route([
      L.latLng(gpsPos.lat, gpsPos.lng),
      L.latLng(simplePos.lat, simplePos.lng),
    ], (err, routes) => {
      if (err) {
        console.error('Fehler bei der Routenberechnung:', err);
        return;
      }
      console.log('Route berechnet:', routes);
    });
  };

  return { calculateRoute };
};

export default Route;

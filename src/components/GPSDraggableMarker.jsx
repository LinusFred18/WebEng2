import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef, useState, forwardRef, useImperativeHandle,} from 'react';
import useGPSLocation from './gps';


// A draggable marker that shows and updates the user's GPS position
const GPSDraggableMarker = ({ gpsPosition, setGpsPosition, clearRoutes, setGpsReady, calculateRoute, destinationSelected, setDestinationSelected }) => {
  const { gpsLocation } = useGPSLocation(); // Fetches live GPS location from a custom hook
  const markerRef = useRef(null);

  // Update GPS position when new GPS location becomes available
  useEffect(() => {
    if (gpsLocation) {
      setGpsPosition([gpsLocation.latitude, gpsLocation.longitude]);
      setGpsReady(true); // Mark that GPS data is ready to be used
    }
  }, [gpsLocation]);

  // Handles marker drag end event: updates position and resets route
  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        setGpsPosition([newPos.lat, newPos.lng]); // Update the marker position
        clearRoutes(); // Clear any existing routes
        setGpsReady(true); // Set GPS as ready again after manual move
        if (!destinationSelected) {
          setDestinationSelected(true); // Mark destination as selected if not already
        }
      }
    },
  };

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={gpsPosition}
      ref={markerRef}
    >
      <Popup>
        <b>GPS Marker</b><br />
        Latitude: {gpsPosition[0].toFixed(6)}<br />
        Longitude: {gpsPosition[1].toFixed(6)}
      </Popup>
    </Marker>
  );
};

export default GPSDraggableMarker;
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRef, useImperativeHandle, forwardRef } from 'react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = forwardRef((props, ref) => {
  const gpsMarkerRef = useRef(null);
  const simpleMarkerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getMarkers() {
      const gpsPos = gpsMarkerRef.current?.getLatLng();
      const simplePos = simpleMarkerRef.current?.getLatLng();
      return { gpsPos, simplePos };
    }
  }));

  const initialGpsPosition = [47.666873, 9.444825];
  const initialSimplePosition = [48.150901, 11.571602];

  return (
    <MapContainer
      center={initialGpsPosition}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: '60vh', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* GPS Marker */}
      <Marker
        draggable={true}
        position={initialGpsPosition}
        ref={gpsMarkerRef}
      >
        <Popup>
          <b>GPS Marker</b><br />
          Latitude: {initialGpsPosition[0]}<br />
          Longitude: {initialGpsPosition[1]}
        </Popup>
      </Marker>

      {/* Manueller Marker */}
      <Marker
        draggable={true}
        position={initialSimplePosition}
        ref={simpleMarkerRef}
      >
        <Popup>
          <b>Manueller Marker</b><br />
          Latitude: {initialSimplePosition[0]}<br />
          Longitude: {initialSimplePosition[1]}
        </Popup>
      </Marker>
    </MapContainer>
  );
});

export default MapView;

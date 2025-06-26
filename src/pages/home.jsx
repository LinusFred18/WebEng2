import { useState, useRef } from 'react';
import {Page} from 'framework7-react';

import ReverseGeocoding from '../components/reverseGeocoding';
import MapView from '../components/map';
import HomeViewButton from '../components/homeViewButton';
import FadeInMenu from '../components/fade-in-menu';

const HomePage = () => {
  const [addressData, setAddressData] = useState(null);
  // gps coordinates of user
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  // destination gps coordinates
  const [latitude2, setLatitude2] = useState(null);
  const [longitude2, setLongitude2] = useState(null);

  const mapRef = useRef();
  
  // calculation of the route
  const handleRouteCalculation = () => {
    if (mapRef.current) {
      mapRef.current.calculateRoute(); 
    }
  };

  const handleHomeViewClick = () => {
    handleRouteCalculation();
  };

  return (
    <Page name="home">
      {/* Map */}
      <MapView
        latitude={latitude}
        longitude={longitude}
        setLatitude={setLatitude2}
        setLongitude={setLongitude2}
        ref={mapRef}
      />

      {/* Home button */}
      <HomeViewButton onClick={handleHomeViewClick} />

      {/* Reverse geo coding*/}
      <ReverseGeocoding
        setAddressData={setAddressData}
        setLatitude={setLatitude}
        setLongitude={setLongitude}
        latitude2={latitude2}
        longitude2={longitude2}
      />
      
      {/* Hamburger menu */}
      <FadeInMenu mapRef={mapRef}/>
    </Page>
  );
};

export default HomePage;

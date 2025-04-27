import React, { useRef } from 'react';
import {
  Page,
  Navbar,
  NavLeft,
  NavTitle,
  NavTitleLarge,
  NavRight,
  Link,
  Toolbar,
  Block,
  BlockTitle,
  List,
  ListItem,
  Button,
} from 'framework7-react';

import ReverseGeocoding from './reverseGeocoding';
import MapView from './map';

const HomePage = () => {
  const mapRef = useRef();

  const handleRouteCalculation = () => {
    if (mapRef.current) {
      mapRef.current.calculateRoute(); 
    }
  };

  return (
    <Page name="home">

      {/* Page content */}
      <MapView ref={mapRef} />
      <Button fill onClick={handleRouteCalculation} style={{ margin: '1em' }}>
        Route berechnen
      </Button>

      <ReverseGeocoding />

      <BlockTitle>Panels</BlockTitle>
      <Block className="grid grid-cols-2 grid-gap">
        <Button fill panelOpen="left">Left Panel</Button>
        <Button fill panelOpen="right">Right Panel</Button>
      </Block>

    </Page>
  );
};
export default HomePage;

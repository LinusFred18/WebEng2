import React, { useRef } from 'react';
import {
  Page,
  Block,
  BlockTitle,
  Button,
} from 'framework7-react';

import ReverseGeocoding from './reverseGeocoding';
import MapView from './map';
import Route from './route'; // Import der neuen Route-Komponente

const HomePage = () => {
  const routeRef = useRef(null);

  const handleRouteCalculation = () => {
    if (routeRef.current) {
      routeRef.current.calculateRoute();
    }
  };

  return (
    <Page name="home">
      <MapView routeRef={routeRef} />
      <ReverseGeocoding />

      <Block strong>
        <Button fill onClick={handleRouteCalculation}>
          Route berechnen
        </Button>
      </Block>

      <BlockTitle>Panels</BlockTitle>
      <Block className="grid grid-cols-2 grid-gap">
        <Button fill panelOpen="left">Left Panel</Button>
        <Button fill panelOpen="right">Right Panel</Button>
      </Block>
    </Page>
  );
};

export default HomePage;

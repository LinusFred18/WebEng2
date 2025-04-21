import React from 'react';
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
import MapView from './gps';
import ReverseGeocoding from './reverseGeocoding';
import MapView from './map';

const HomePage = () => (
  <Page name="home">

    {/* Page content */}
    <MapView />
    <ReverseGeocoding />

    <BlockTitle>Panels</BlockTitle>
    <Block className="grid grid-cols-2 grid-gap">
      <Button fill panelOpen="left">Left Panel</Button>
      <Button fill panelOpen="right">Right Panel</Button>
    </Block>

  </Page>
);
export default HomePage;
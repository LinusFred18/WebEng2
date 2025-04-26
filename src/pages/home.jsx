import React, { useState }from 'react';
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
import WikiFetcher from '../components/WikipediaAPI';

const HomePage = () => {
  const [addressData, setAddressData] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [latitude2, setLatitude2] = useState(null);
  const [longitude2, setLongitude2] = useState(null);


  return(
  <Page name="home">

    {/* Page content */}
    <MapView latitude={latitude} longitude={longitude} setLatitude={setLatitude2} setLongitude={setLongitude2}/>
    <ReverseGeocoding setAddressData={setAddressData} setLatitude={setLatitude} setLongitude={setLongitude} latitude2={latitude2} longitude2={longitude2} />
    <WikiFetcher query={addressData}/>

    <BlockTitle>Panels</BlockTitle>
    <Block className="grid grid-cols-2 grid-gap">
      <Button fill panelOpen="left">Left Panel</Button>
      <Button fill panelOpen="right">Right Panel</Button>
    </Block>
    <Block strong>
      Straße: {addressData?.road || 'Warte auf Adresse...'}
    </Block>

  </Page>
);
};
export default HomePage;
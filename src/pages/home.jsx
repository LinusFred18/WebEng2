import { useState } from 'react';
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
  Sheet,
  PageContent,
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

  const [sheetOpened, setSheetOpened] = useState(false);

  return (
    <Page name="home">

      {/* Karte */}
      <MapView
        latitude={latitude}
        longitude={longitude}
        setLatitude={setLatitude2}
        setLongitude={setLongitude2}
      />

      {/* Reverse Geocoding */}
      <ReverseGeocoding
        setAddressData={setAddressData}
        setLatitude={setLatitude}
        setLongitude={setLongitude}
        latitude2={latitude2}
        longitude2={longitude2}
      />

      {/* Button zum Öffnen der Wikipedia Infos */}
      <Block strong>
        <Button fill onClick={() => setSheetOpened(true)}>
          Wikipedia Infos anzeigen
        </Button>
      </Block>

      {/* Schwebendes Sheet */}
      <Sheet
        opened={sheetOpened}
        onSheetClosed={() => setSheetOpened(false)}
        swipeToClose
        backdrop
      >
        <PageContent>

          {/* Optional: kleiner Balken zum Hochziehen */}
          <div style={{
            width: '40px',
            height: '5px',
            background: '#ccc',
            borderRadius: '4px',
            margin: '10px auto',
          }} />

          <BlockTitle>Wikipedia Informationen</BlockTitle>

          <WikiFetcher query={addressData} />

          <Block strong>
            <Button fill onClick={() => setSheetOpened(false)}>
              Schließen
            </Button>
          </Block>
        </PageContent>
      </Sheet>

      {/* Andere Elemente */}
      <BlockTitle>Panels</BlockTitle>
      <Block className="grid grid-cols-2 grid-gap">
        <Button fill panelOpen="left">Left Panel</Button>
        <Button fill panelOpen="right">Right Panel</Button>
      </Block>

      {/* Adresse anzeigen */}
      <Block strong>
        Straße: {addressData?.road || 'Warte auf Adresse...'}
      </Block>

    </Page>
  );
};

export default HomePage;

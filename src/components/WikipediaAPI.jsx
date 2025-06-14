import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Block,
  Button
} from 'framework7-react';

const WikiFetcher = ({ query }) => {
  const [wikipediaData, setWikipediaData] = useState([]);

  const fetchWikiData = async (searchTerm) => {
    if (!searchTerm) return;

    const url = `https://de.wikipedia.org/w/api.php?origin=*&action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      const results = data.query.search.map(item => ({
        title: item.title,
        snippet: item.snippet,
        url: `https://de.wikipedia.org/?curid=${item.pageid}`
      }));

      setWikipediaData(results);
    } catch (err) {
      console.error('Fehler beim Abrufen der Daten:', err);
      setWikipediaData([]);
    }
  };

  useEffect(() => {
    fetchWikiData(query || 'München');
  }, [query]);

  return (
    <Block strong inset>
      <h2 className="text-align-center">Wikipedia-Ergebnisse für „{query || 'München'}“</h2>

      {wikipediaData.length > 0 ? (
        wikipediaData.map((item, index) => (
          <Card key={index} className="margin-bottom">
            <CardHeader>{item.title}</CardHeader>
            <CardContent>
              <div dangerouslySetInnerHTML={{ __html: item.snippet }} />
              <Button
                fill
                small
                style={{
                  marginTop: '8px',
                  backgroundColor: '#1a73e8',
                  color: 'white'
                }}
                onClick={() => window.open(item.url, '_blank')}
              >
                Zum Artikel
              </Button>
            </CardContent>
          </Card>
        ))
      ) : (
        <Block className="text-align-center">Keine Ergebnisse gefunden.</Block>
      )}
    </Block>
  );
};

export default WikiFetcher;

import React, { useEffect, useState } from 'react';

const WikiFetcher = ({ query }) => {
  const [wikipediaData, setWikipediaData] = useState([]);

  const fetchWikiData = async (searchTerm) => {
    if (!searchTerm) return; // Falls query noch leer ist, nichts machen

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
    fetchWikiData(query); 
  }, [query]); // <-- immer neu suchen, wenn sich die query ändert!

  if (query == null){
    query = "München"
  }
  return (
    <div>
      <h1>Wikipedia-Ergebnisse für „{query}“</h1>
      {wikipediaData.length > 0 ? (
        wikipediaData.map((item, index) => (
          <div key={index} style={{ marginBottom: '2rem' }}>
            <h2>{item.title}</h2>
            <p dangerouslySetInnerHTML={{ __html: item.snippet }} />
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              Zum Artikel
            </a>
          </div>
        ))
      ) : (
        <p>Keine Ergebnisse gefunden.</p>
      )}
    </div>
  );
};

export default WikiFetcher;

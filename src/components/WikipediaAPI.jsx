import React, { useEffect, useState } from 'react';

const WikiFetcher = () => {
  const [wikipediaData, setWikipediaData] = useState([]);
  const searchTerm = 'Berlin';
  const url = `https://de.wikipedia.org/w/api.php?origin=*&action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json`;

  // This method fetches the Wikipedia data, from the term defined in the "searchTerm" variable.
  // It returns a JSON with the title, the snippet and the URL
  const fetchWikiData = async () => {
    try {
      const response = await fetch(url);
      const data = await response.json();

      const results = data.query.search.map(item => ({
        title: item.title,
        snippet: item.snippet,
        url: `https://de.wikipedia.org/?curid=${item.pageid}`
      }));

      console.log('Fetched Wikipedia data:', results); // Debug-Ausgabe der kompletten Ergebnisse

      setWikipediaData(results);
    } catch (err) {
      console.error('Fehler beim Abrufen der Daten:', err);
      setWikipediaData([]);
    }
  };

  // This method destructures the wiki data given in the function call.
  // At this point it just prints the components in the console.
  const destructionWikiData = async (data) => {
    let number = 1;
    for (let i = 0; i < number; i++) {
      let { title, snippet, url } = data[i];
      console.log('Title:', title);
      console.log('Snippet:', snippet);
      console.log('URL:', url);
    }
  };

  // Fetch and destructure the data once on mount
  useEffect(() => {
    const run = async () => {
      const data = await fetchWikiData();
      await destructionWikiData(data);
    };

    run();
  }, []);

  return (
    <div>
      <h1>Wikipedia-Ergebnisse für „{searchTerm}“</h1>
      {wikipediaData.map((item, index) => (
        <div key={index} style={{ marginBottom: '2rem' }}>
          <h2>{item.title}</h2>
          <p dangerouslySetInnerHTML={{ __html: item.snippet }} />
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            Zum Artikel
          </a>
        </div>
      ))}
    </div>
  );
};

export default WikiFetcher;

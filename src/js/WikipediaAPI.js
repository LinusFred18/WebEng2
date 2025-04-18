const fetch = require('node-fetch'); 

const searchTerm = 'Berlin';
const url = `https://en.wikipedia.org/w/api.php?origin=*&action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json`;

async function fetchWikiData() {
  try {
    const response = await fetch(url);
    const data = await response.json();

    const wikipediaData = data.query.search.map(item => ({
      title: item.title,
      snippet: item.snippet,
      url: `https://en.wikipedia.org/?curid=${item.pageid}`
    }));

    console.log(wikipediaData);
  } catch (err) {
    console.error('Fehler beim Abrufen der Daten:', err);
  }

}

fetchWikiData();
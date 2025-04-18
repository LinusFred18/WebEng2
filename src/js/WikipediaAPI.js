const fetch = require('node-fetch'); 

const searchTerm = 'Berlin';
const url = `https://en.wikipedia.org/w/api.php?origin=*&action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json`;

//This method fetches the wikipedia data, from the term defined in the "searchTerm" variable. it returns a json with the title, the snippet and the url
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
    return wikipediaData;
  } catch (err) {
    console.error('Fehler beim Abrufen der Daten:', err);
    return [];
  }
  
}


//this method destructures the wiki data given in the function call. At this point it just prints the components in the console.
async function destructionWikiData(wikipediaData){
  let number = 1;
  for(let i = 0; i < number; i++){
    let {title, snippet, url} = wikipediaData[i];
    console.log(title);
    console.log(snippet);
    console.log(url);
  }

}


async function main() {
  const data = await fetchWikiData();
  await destructionWikiData(data);
}

main();

//maybe you need to execute
//npm uninstall node-fetch
//npm install node-fetch@2
//first
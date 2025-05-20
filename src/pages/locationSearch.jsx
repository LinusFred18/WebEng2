import { useState } from 'react';

const LocationSearch = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [debounceTimer, setDebounceTimer] = useState(null);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceTimer) clearTimeout(debounceTimer);
    setDebounceTimer(setTimeout(() => fetchSuggestions(val), 300));
  };

  const fetchSuggestions = async (val) => {
    if (!val || val.length < 2) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?countrycodes=de&format=json&q=${encodeURIComponent(val)}`);
      const data = await res.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Fehler bei Nominatim-Abfrage:', error);
    }
  };

  const handleSelect = (place) => {
    setQuery(place.display_name);
    setSuggestions([]);
    onSelect({
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      name: place.display_name
    });
  };

  return (
    <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 1001, width: '80%', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', padding: '0.5rem' }}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Ort suchen..."
        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      {suggestions.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
          {suggestions.map((place, idx) => (
            <li key={idx} onClick={() => handleSelect(place)} style={{ padding: '0.5rem', borderBottom: '1px solid #eee', cursor: 'pointer' }}>
              {place.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSearch;
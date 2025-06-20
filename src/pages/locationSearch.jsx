import { useState, useRef, forwardRef, useImperativeHandle } from 'react';

const LocationSearch = forwardRef(({ onSelect }, ref) => {
  const [displayValue, setDisplayValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    clearSearchField() {
      setDisplayValue('');
      setInputValue('');
    }
  }));

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    setError('');
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
    const name = place.display_name;
    setDisplayValue(name);
    setInputValue('');
    setSuggestions([]);
    setError('');
    onSelect({
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      name
    });
    inputRef.current?.blur();
  };

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      } else {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?countrycodes=de&format=json&q=${encodeURIComponent(inputValue)}`);
          const data = await res.json();
          if (data.length > 0) {
            handleSelect(data[0]);
          } else {
            setError('Ort nicht gefunden. Bitte überprüfe deine Eingabe.');
          }
        } catch (err) {
          console.error('Fehler bei Sofortsuche:', err);
          setError('Fehler bei der Ortssuche.');
        }
      }
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1001,
      width: '80%',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      padding: '0.5rem'
    }}>
      <input
        ref={inputRef}
        type="text"
        value={isFocused ? inputValue : displayValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setIsFocused(true);
          setInputValue('');
          setSuggestions([]);
        }}
        onBlur={() => setIsFocused(false)}
        placeholder="Ort suchen..."
        style={{
          width: '100%',
          padding: '0.5rem',
          borderRadius: '4px',
          border: '1px solid #ccc'
        }}
      />
      {suggestions.length > 0 && (
        <ul style={{
          listStyle: 'none',
          padding: 0,
          marginTop: '0.5rem',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {suggestions.map((place, idx) => (
            <li key={idx} onClick={() => handleSelect(place)} style={{
              padding: '0.5rem',
              borderBottom: '1px solid #eee',
              cursor: 'pointer',
              textAlign: 'left'
            }}>
              {place.display_name}
            </li>
          ))}
        </ul>
      )}
      {error && (
        <div style={{
          marginTop: '0.5rem',
          color: 'red',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}
    </div>
  );
});

export default LocationSearch;

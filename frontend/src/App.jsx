import { useState } from 'react';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    try {
      const res = await fetch(`http://localhost:5000/weather?city=${city}`);
      const data = await res.json();

      if (res.ok) {
        setWeather(data);
        setError('');
      } else {
        setError(data.message || 'Error fetching weather');
        setWeather(null);
      }
    } catch (err) {
      setError('Error connecting to server');
      setWeather(null);
    }
  };

  return (
    <div className="app">
      <h1>🌦️ Weather App</h1>
      <input
        type="text"
        placeholder="Enter city"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <button onClick={fetchWeather}>Get Weather</button>

      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather">
          <h2>{weather.name}</h2>
          <p>🌡️ {weather.temp} °C</p>
          <p>💧 Humidity: {weather.humidity}%</p>
          <p>🌥️ {weather.description}</p>
        </div>
      )}
    </div>
  );
}

export default App;

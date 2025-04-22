import { useState } from 'react';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');

  const fetchWeatherByCity = async () => {
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
    } catch {
      setError('Error connecting to server');
      setWeather(null);
    }
  };

  const fetchWeatherByLocation = () => {

    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`http://localhost:5000/weather?lat=${latitude}&lon=${longitude}`);
          const data = await res.json();

          if (res.ok) {
            setWeather(data);
            setError('');
          } else {
            setError(data.message || 'Error fetching weather');
            setWeather(null);
          }
        } catch {
          setError('Error connecting to server');
          setWeather(null);
        }
      },
      () => {
        setError('Permission denied or error getting location');
      }
    );
  };

  return (
    <div className="app">
      <h1>🌦️ Weather App</h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={fetchWeatherByCity}>Get Weather</button>
        <button onClick={fetchWeatherByLocation} style={{ marginLeft: '10px' }}>
          📍 Use My Location
        </button>
      </div>

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

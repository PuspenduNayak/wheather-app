import { useState } from 'react';
import './App.css';
import tempimage from './assets/temperature.png' //this is imported from asssets folder
import humidityimage from './assets/humidity.png' //this is imported from asssets folder
import editinfoimage from './assets/edit-info.png' //this is imported from asssets folder

const BACKEND_URL = 'https://wheather-app-2pba.onrender.com';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState('');

  const [crop, setCrop] = useState('');

  const clearMessages = () => {
    setError('');
    setWeather(null);
    setForecast([]);
  };

  const fetchCropRecommendation = async (temp, humidity) => {
    try {
      const res = await fetch(`${BACKEND_URL}/recommend?temp=${temp}&humidity=${humidity}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCrop(data.crop); // 🔧 ADDED: Set recommended crop
    } catch (err) {
      onsole.error('Crop Fetch Error:', err);
      setError('Failed to fetch crop recommendation');
    }
  };

  const fetchWeatherByCity = async () => {
    clearMessages();
    try {
      const res = await fetch(`${BACKEND_URL}/weather?city=${city}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setWeather(data);

      await fetchCropRecommendation(data.temp, data.humidity); // 🔧 ADDED

      const forecastRes = await fetch(`${BACKEND_URL}/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}`);
      const forecastData = await forecastRes.json();
      if (!forecastRes.ok) throw new Error(forecastData.message);
      setForecast(forecastData.forecast);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchWeatherByLocation = () => {
    clearMessages();
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`${BACKEND_URL}/weather?lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.message);
          setWeather(data);

          await fetchCropRecommendation(data.temp, data.humidity); // 🔧 ADDED

          const forecastRes = await fetch(`${BACKEND_URL}/forecast?lat=${latitude}&lon=${longitude}`);
          const forecastData = await forecastRes.json();
          if (!forecastRes.ok) throw new Error(forecastData.message);
          setForecast(forecastData.forecast);
        } catch (err) {
          setError(err.message);
        }
      },
      () => setError('Permission denied')
    );
  };

  return (
    <div className="app">
      <h1>🌤️ AgriWeather Pro</h1>

      <div className="search">
        <input
          type="text"
          placeholder="Enter city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={fetchWeatherByCity}>Get Weather</button>
        <button onClick={fetchWeatherByLocation}>📍 Use My Location</button>
      </div>

      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-info">
          <h2>{weather.name}</h2>
          <div className='fullweather'>
            {/* this is changed three divs */}
            <div className='weatherinfo'><img src={tempimage} alt="" className='weatherimage' /> <br />  Temp: {weather.temp}°C</div>
            <div className='weatherinfo'> <img src={humidityimage} alt="" className='weatherimage' /><br />   Humidity: {weather.humidity}%</div>
            <div className='weatherinfo'> <img src={editinfoimage} alt="" className='weatherimage' /> <br />  Desc: {weather.description}</div>
          </div>
          {crop && ( // 🔧 ADDED: Show crop recommendation
            <div className="crop-info">
              <h3>🌾 Recommended Crop:</h3>
              <p>{crop}</p>
            </div>
          )}
        </div>
      )}

      {forecast.length > 0 && (
        <div className="forecast">
          <h3>5-Day Forecast</h3>
          <div className="forecast-grid">
            {forecast.map((day, i) => (
              <div key={i} className="day">
                <strong>{day.date}</strong>
                <p>🌡️ {day.temp}°C</p>
                <p>🌥️ {day.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

// backend/index.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
const PORT = 5000;

const API_KEY = process.env.API_KEY;

// Current weather by city or coordinates
app.get('/weather', async (req, res) => {
  const { city, lat, lon } = req.query;

  let url = `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}&units=metric`;

  if (city) {
    url += `&q=${city}`;
  } else if (lat && lon) {
    url += `&lat=${lat}&lon=${lon}`;
  } else {
    return res.status(400).json({ message: 'City or coordinates required' });
  }

  try {
    const response = await axios.get(url);
    const data = response.data;
    res.json({
      name: data.name,
      temp: data.main.temp,
      humidity: data.main.humidity,
      description: data.weather[0].description,
      coord: data.coord,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching weather data' });
  }
});

// 7-day forecast
// backend/index.js
app.get('/forecast', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ message: 'Coordinates required' });
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast`,
      {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric', // Celsius temperature
        },
      }
    );

    // Get today's date string for comparison
    const todayDate = new Date().toLocaleDateString();

    // Group the data by date (show only one entry per day)
    const forecast = [];
    let currentDate = null;

    response.data.list.forEach((entry) => {
      const forecastDate = new Date(entry.dt * 1000).toLocaleDateString();

      // Skip today's date
      if (forecastDate === todayDate) return;

      // Only add the first entry of each day
      if (forecastDate !== currentDate) {
        forecast.push({
          date: forecastDate,
          time: new Date(entry.dt * 1000).toLocaleTimeString(),
          temp: entry.main.temp,
          description: entry.weather[0].description,
        });

        currentDate = forecastDate; // Update current date to avoid duplicate entries
      }
    });

    res.json({ forecast });
  } catch (err) {
    console.log('Loaded API key:', API_KEY);
    console.error('Forecast Error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Error fetching forecast' });
  }
});



app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

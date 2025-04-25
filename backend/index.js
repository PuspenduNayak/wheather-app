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

// ===============================
// Crop Recommendation
// ===============================
app.get('/recommend', (req, res) => {
  try {
    const { temp, humidity } = req.query;

    if (!temp || !humidity) {
      return res.status(400).json({ message: 'Temperature and humidity are required' });
    }

    const t = parseFloat(temp);
    const h = parseFloat(humidity);

    let crop = 'Unknown'; // Default value

    // Rice: Prefers warm and humid conditions
    if (t >= 20 && t <= 35 && h >= 60 && h <= 90) {
      crop = 'Rice';
    }
    // Wheat: Prefers cool to moderate temperatures and moderate humidity
    else if (t >= 18 && t <= 27 && h >= 50 && h <= 70) {
      crop = 'Wheat';
    }
    // Maize: Warm temperatures and moderate to high humidity
    else if (t >= 22 && t <= 35 && h >= 50 && h <= 80) {
      crop = 'Maize';
    }
    // Cotton: Prefers hot and dry conditions
    else if (t >= 24 && t <= 35 && h >= 40 && h <= 60) {
      crop = 'Cotton';
    }
    // Sugarcane: Requires high temperature and humidity
    else if (t >= 25 && t <= 38 && h >= 60 && h <= 90) {
      crop = 'Sugarcane';
    }
    // Barley: Prefers cool climates
    else if (t >= 15 && t <= 25 && h >= 40 && h <= 70) {
      crop = 'Barley';
    }
    // Groundnut (Peanut): Grows in hot, dry climates
    else if (t >= 25 && t <= 40 && h >= 30 && h <= 70) {
      crop = 'Groundnut (Peanut)';
    }
    // Soybean: Thrives in warm climates
    else if (t >= 20 && t <= 30 && h >= 50 && h <= 80) {
      crop = 'Soybean';
    }
    // Pulses (Chickpeas, Lentils): Prefers moderate temperature and humidity
    else if (t >= 15 && t <= 30 && h >= 40 && h <= 60) {
      crop = 'Pulses (Chickpeas, Lentils)';
    }
    // Mustard: Cool to mild temperatures, tolerates light frost
    else if (t >= 10 && t <= 25 && h >= 40 && h <= 60) {
      crop = 'Mustard';
    }
    // Tea: Requires high humidity and moderate temperatures
    else if (t >= 15 && t <= 30 && h >= 60 && h <= 90) {
      crop = 'Tea';
    }
    // Rice (Lowland): Lower temperatures, high humidity
    else if (t >= 18 && t <= 28 && h >= 70 && h <= 90) {
      crop = 'Rice (Lowland)';
    }

    // If no suitable crop is found, the default 'Unknown' will remain

    // Add a fallback if no suitable crop found
    else {
      crop = 'No ideal match found. Consider consulting local agricultural data for more details.';
    }

    res.json({ crop });
  } catch (err) {
    console.error('Crop Recommendation Error:', err.message);
    res.status(500).json({ message: 'Error generating crop recommendation' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

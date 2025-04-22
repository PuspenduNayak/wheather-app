require('dotenv').config();
const axios = require('axios');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // allow requests from frontend

const PORT = 5000;

app.get('/weather', async (req, res) => {
  const city = req.query.city;
  const apiKey = process.env.API_KEY;

  if (!city) {
    return res.status(400).json({ message: 'City is required' });
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          q: city,
          appid: apiKey,
          units: 'metric'
        }
      }
    );

    const data = response.data;
    res.json({
      name: data.name,
      temp: data.main.temp,
      humidity: data.main.humidity,
      description: data.weather[0].description
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch weather data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

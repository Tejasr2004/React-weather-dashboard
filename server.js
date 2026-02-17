import express from 'express';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = '0bdc56b1a0c72c03711ba645a649363d';

// Simple in-memory cache: { "city_name": { data: {...}, timestamp: 123456789 } }
const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

app.use(cors());
app.use(express.static('public'));

app.get('/api/weather', async (req, res) => {
    console.log(`Received request for city: ${req.query.city}`);
    const { city } = req.query;
    if (!city) {
        return res.status(400).json({ error: 'City is required' });
    }

    const normalizedCity = city.toLowerCase().trim();

    // Check Cache
    if (cache.has(normalizedCity)) {
        const { data, timestamp } = cache.get(normalizedCity);
        if (Date.now() - timestamp < CACHE_DURATION) {
            console.log(`Serving ${city} from cache`);
            return res.json(data);
        } else {
            console.log(`Cache expired for ${city}`);
            cache.delete(normalizedCity);
        }
    }

    try {
        console.log(`Fetching weather for ${city}...`);
        const response = await axios.get(
            `http://api.weatherstack.com/current?access_key=${API_KEY}&query=${city}`
        );
        console.log('Weatherstack response received:', response.status);

        const data = response.data;
        // console.log('Data:', JSON.stringify(data).substring(0, 200));

        if (data.error) {
            console.error('API Error:', data.error);
            // Handle specific Weatherstack errors
            if (data.error.code === 104) {
                return res.status(429).json({ error: 'Monthly usage limit reached. Please upgrade plan or try again later.' });
            }
            if (data.error.code === 601) {
                return res.status(404).json({ error: 'City not found. Please try another location.' }); // Missing query
            }
            if (data.error.code === 615) {
                return res.status(404).json({ error: 'City request failed. Recheck the spelling.' }); // Request failed
            }
            return res.status(400).json({ error: data.error.info || 'Error fetching weather data' });
        }

        // Transform Weatherstack data to match our frontend structure partially
        const weatherData = {
            current: {
                name: data.location.name,
                sys: { country: data.location.country },
                main: {
                    temp: data.current.temperature,
                    humidity: data.current.humidity,
                    pressure: data.current.pressure
                },
                wind: {
                    speed: data.current.wind_speed
                },
                weather: [
                    {
                        main: data.current.weather_descriptions[0],
                        description: data.current.weather_descriptions[0]
                    }
                ]
            },
            forecast: [] // No forecast in free tier
        };

        // Save to Cache
        cache.set(normalizedCity, { data: weatherData, timestamp: Date.now() });
        console.log(`Cached data for ${city}`);

        console.log('Sending weatherData');
        res.json(weatherData);

    } catch (error) {
        console.error('Server Error:', error.message);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            return res.status(error.response.status).json({ error: 'Provider Error: ' + error.response.statusText });
        }
        res.status(500).json({ error: 'Server error fetching weather data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

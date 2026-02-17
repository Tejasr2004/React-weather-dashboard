import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.WEATHERSTACK_API_KEY;

if (!API_KEY) {
    console.error("Error: WEATHERSTACK_API_KEY is not set in .env file.");
    process.exit(1);
}

app.use(cors());
app.use(express.static('public'));

app.get('/api/weather', async (req, res) => {
    console.log(`Received request for city: ${req.query.city}`);
    const { city } = req.query;
    if (!city) {
        return res.status(400).json({ error: 'City is required' });
    }

    try {
        console.log(`Fetching weather for ${city}...`);
        const response = await axios.get(
            `http://api.weatherstack.com/current?access_key=${API_KEY}&query=${city}`
        );
        console.log('Weatherstack response received:', response.status);

        const data = response.data;
        console.log('Data:', JSON.stringify(data).substring(0, 200));

        if (data.error) {
            console.error('API Error:', data.error);
            return res.status(401).json({ error: data.error.info || 'Error fetching weather data' });
        }

        // Transform Weatherstack data to match our frontend structure partially
        // Note: Weatherstack free tier does NOT assume forecast, so we return empty list
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
                        main: data.current.weather_descriptions[0], // Use description as main for simplicity or map it
                        description: data.current.weather_descriptions[0]
                    }
                ]
            },
            forecast: [] // No forecast in free tier
        };

        console.log('Sending weatherData:', JSON.stringify(weatherData).substring(0, 200));
        res.json(weatherData);

    } catch (error) {
        console.error('Server Error:', error.message);
        res.status(500).json({ error: 'Server error fetching weather data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

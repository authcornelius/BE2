const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the static HTML file
app.use(express.static(path.join(__dirname, 'views')));

app.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name || 'Visitor';
    let clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Ensure we are using IPv4
    if (clientIp.includes(',')) {
        clientIp = clientIp.split(',')[0].trim();
    }

    if (clientIp.includes(':')) {
        clientIp = clientIp.split(':').pop();
    }

    try {
        // Fetch location based on IP address
        const locationResponse = await axios.get(`https://ipinfo.io/${clientIp}/json`);
        const locationData = locationResponse.data;
        const city = locationData.city || 'Unknown';

        // Fetch temperature from OpenWeatherMap
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                q: city,
                units: 'metric',
                appid: process.env.OPENWEATHERMAP_API_KEY
            }
        });
        const temperature = weatherResponse.data.main.temp;

        res.json({
            client_ip: clientIp,
            location: city,
            greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${city}`
        });
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.status(500).json({ error: 'Unable to fetch data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

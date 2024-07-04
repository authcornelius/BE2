const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

function extractValidIPv4(ipString) {
    if (!ipString) return null;
    // Extract the first IP in case of a list
    let ip = ipString.split(',')[0].trim();
    // Check if it's a valid IPv4 address
    const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Pattern.test(ip) ? ip : null;
}

app.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name || 'Visitor';
    const rawIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const clientIp = extractValidIPv4(rawIp);

    if (!clientIp) {
        return res.status(400).json({ error: 'Invalid IPv4 address' });
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

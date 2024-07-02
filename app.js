const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name || 'Visitor';
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {
        
        const locationResponse = await axios.get(`http://ip-api.com/json/${clientIp}`);
        const locationData = locationResponse.data;
        const city = locationData.city || 'Unknown';
        const tempResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=YOUR_OPENWEATHERMAP_API_KEY`);
        const temperature = tempResponse.data.main.temp;

        res.json({
            client_ip: clientIp,
            location: city,
            greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${city}`
        });
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

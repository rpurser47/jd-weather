const express = require('express');
const cors = require('cors');
const axios = require('axios');
const OpenAI = require('openai');
const { createClient } = require('pexels');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Read JD's personality from file
const jdPersonality = fs.readFileSync(path.join(__dirname, 'jd_personality.txt'), 'utf8');

// Initialize Pexels client
const pexelsClient = createClient(process.env.PEXELS_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// State code to full name mapping
const stateMap = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

console.log('OpenAI client initialized with API key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');

const weatherApi = axios.create({
  baseURL: 'https://api.weather.gov',
  headers: {
    'User-Agent': process.env.WEATHER_USER_AGENT
  }
});

// Helper function to get weather data
async function getWeatherData(endpoint) {
  try {
    const response = await weatherApi.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Weather API Error:', error);
    throw error;
  }
}

// Helper function to extract location from message using OpenAI
async function extractLocation(message) {
  console.log('Extracting location from message:', message);
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    console.log('Calling OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Extract the US location being asked about in the weather-related question. 
          - If a location is found, respond with ONLY the location in a standardized format: "City, State" or "City, ST" 
          - If no location is found or the location is not in the US, respond with ONLY: "none"

Examples:
Input: "What's the weather like in New York?"
Output: New York, NY

Input: "Tell me the forecast for miami"
Output: Miami, FL

Input: "How's the weather in coos bay oregon"
Output: Coos Bay, OR

Input: "What's the temperature?"
Output: none`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0,
      max_tokens: 20
    });

    console.log('OpenAI API response:', JSON.stringify(completion, null, 2));
    const location = completion.choices[0].message.content.trim();
    console.log('Extracted location:', location);
    return location === 'none' ? null : location;
  } catch (error) {
    console.error('OpenAI Location Extraction Error:', error);
    if (error.response) {
      console.error('OpenAI API Error Response:', error.response.data);
    }
    throw error;
  }
}


// Helper function to get coordinates for a location name
async function getCoordinatesForLocation(locationName) {
  try {
    console.log('Geocoding location:', locationName);
    
    // Add state if not present (assuming US)
    const hasState = /,\s*[A-Z]{2}$/.test(locationName);
    if (!hasState && locationName.toLowerCase().includes('oregon')) {
      locationName = locationName.replace(/oregon/i, 'OR');
    }
    
    // Use OpenStreetMap Nominatim API for geocoding with additional parameters
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1&countrycodes=us&addressdetails=1&featuretype=city`;
    console.log('Geocoding URL:', geocodeUrl);
    
    const geocodeResponse = await axios.get(geocodeUrl, {
      headers: {
        'User-Agent': process.env.WEATHER_USER_AGENT
      }
    });
    console.log('Geocoding response:', JSON.stringify(geocodeResponse.data, null, 2));
    
    if (geocodeResponse.data && geocodeResponse.data.length > 0) {
      const location = geocodeResponse.data[0];
      console.log('Found coordinates:', { lat: location.lat, lon: location.lon });
      return {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lon)
      };
    }
    
    // If not found, try without feature type restriction
    const fallbackUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1&countrycodes=us`;
    console.log('Trying fallback URL:', fallbackUrl);
    
    const fallbackResponse = await axios.get(fallbackUrl, {
      headers: {
        'User-Agent': process.env.WEATHER_USER_AGENT
      }
    });
    
    if (fallbackResponse.data && fallbackResponse.data.length > 0) {
      const location = fallbackResponse.data[0];
      console.log('Found coordinates from fallback:', { lat: location.lat, lon: location.lon });
      return {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding Error:', error);
    return null;
  }
}

app.post('/api/chat', async (req, res) => {
  try {
    console.log('\n--- New Chat Request ---');
    console.log('Request body:', req.body);
    console.log('Received chat request:', { message: req.body.message });
    const { message, location: browserLocation } = req.body;
    
    if (!message) {
      throw new Error('No message provided');
    }

    console.log('Extracting location from message...');
    let requestedLocation = await extractLocation(message);
    console.log('Location extraction result:', requestedLocation);
    
    let location = browserLocation; // Default to browser location
    let weatherData = { 
      requestedLocation: null,
      browserLocation: browserLocation // Always include browser location
    };

    if (requestedLocation) {
      console.log('Getting coordinates for requested location:', requestedLocation);
      const locationCoords = await getCoordinatesForLocation(requestedLocation);
      if (locationCoords) {
        location = locationCoords;
        weatherData.requestedLocation = requestedLocation;
        // Parse city and state from the location string
        const [city, stateCode] = requestedLocation.split(',').map(part => part.trim());
        weatherData.city = city;
        // Convert state code to full name
        weatherData.state = stateMap[stateCode] || stateCode;

        // Fetch location image
        try {
          // Search for iconic shots
          // Use full state name for better image results
          const searchTerm = `${city} ${weatherData.state} iconic`;
          // Get 20 photos to ensure we have enough to choose from
          const result = await pexelsClient.photos.search({ query: searchTerm, per_page: 20 });
          if (result.photos.length > 0) {
            // Sort photos by width (assuming higher resolution photos are better quality)
            const sortedPhotos = result.photos.sort((a, b) => {
              // Prioritize landscape photos that aren't too tall
              const aRatio = a.width / a.height;
              const bRatio = b.width / b.height;
              // Prefer photos with aspect ratios between 1:1 and 2:1
              const aScore = aRatio >= 1 && aRatio <= 2 ? a.width : 0;
              const bScore = bRatio >= 1 && bRatio <= 2 ? b.width : 0;
              return bScore - aScore;
            });
            // Log photo dimensions for verification
            console.log('Top 5 photos by quality:', sortedPhotos.slice(0, 5).map(p => ({
              id: p.id,
              width: p.width,
              height: p.height,
              ratio: (p.width / p.height).toFixed(2)
            })));
            // Take top 10 (or all if less than 10) and choose randomly
            const topPhotos = sortedPhotos.slice(0, Math.min(10, sortedPhotos.length));
            const randomPhoto = topPhotos[Math.floor(Math.random() * topPhotos.length)];
            console.log(`Selected photo ID ${randomPhoto.id} (${randomPhoto.width}x${randomPhoto.height})`);
            // Use large size for better quality
            weatherData.locationImage = randomPhoto.src.large;
          }
        } catch (error) {
          console.error('Error fetching location image:', error);
        }
      }
    }

    if (location) {
      try {
        console.log('Fetching weather data for coordinates:', location);
        const points = await getWeatherData(`/points/${location.lat},${location.lng}`);
        const forecast = await getWeatherData(points.properties.forecast);
        weatherData = {
          ...weatherData,
          forecast: forecast.properties.periods,
          location: points.properties,
          coordinates: location
        };
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    }

    // Always fetch weather for browser location if available
    if (browserLocation && (!location || location === browserLocation)) {
      try {
        console.log('Fetching weather data for browser location:', browserLocation);
        const browserPoints = await getWeatherData(`/points/${browserLocation.lat},${browserLocation.lng}`);
        const browserForecast = await getWeatherData(browserPoints.properties.forecast);
        weatherData.browserWeather = {
          forecast: browserForecast.properties.periods,
          location: browserPoints.properties
        };
      } catch (error) {
        console.error('Error fetching browser location weather:', error);
      }
    }

    // Prepare context for the AI with explicit location information
    const weatherContext = JSON.stringify({
      ...weatherData,
      fullLocation: weatherData.city && weatherData.state ? `${weatherData.city}, ${weatherData.state}` : null,
      // Include browser location city/state if available
      browserFullLocation: weatherData.browserWeather ? weatherData.browserWeather.location.relativeLocation.properties.city + ", " + 
        weatherData.browserWeather.location.relativeLocation.properties.state : null
    });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `${jdPersonality}

Here's your weather data: ${weatherContext}`
        },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    res.json({ 
      response: completion.choices[0].message.content,
      locationImage: weatherData.locationImage || null
    });
  } catch (error) {
    console.error('\n--- Error in chat endpoint ---');
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
    res.status(500).json({ 
      error: 'Sorry, I encountered an error. Please try again.',
      details: error.message 
    });
  }
});

// Use environment port for deployment, fallback to 5000 for local development
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

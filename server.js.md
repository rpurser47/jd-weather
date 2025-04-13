# Server.js Technical Documentation

## Overview
This file implements the backend server for the Weather Chat application, handling natural language weather queries and integrating with multiple external APIs.

## Key Components

### Server Setup ([server.js:1-20](./server.js#L1-20))
- Express server with CORS and JSON middleware
- Required environment variables:
  - `OPENAI_API_KEY`
  - `WEATHER_USER_AGENT`
  - `PEXELS_API_KEY`
- Personality configuration loaded from external file

### API Clients

1. **OpenAI Client** ([server.js:19-22](./server.js#L19-L22))
   - Initialized with API key from environment
   - Used for both location extraction and chat responses
   - Configured with JD's personality from external file
   - **Configuration**:
     - Model: gpt-4-turbo-preview
     - Temperature: 0.7
     - Max tokens: 1000 (increased for detailed weather discussions)

2. **Pexels Client** ([server.js:14-14](./server.js#L14-L14))
   - Initialized with API key from environment
   - Used for fetching location-based images
   - Enhances responses with visual context

3. **Weather API Client** ([server.js:26-31](./server.js#L26-L31))
   - Base URL: https://api.weather.gov
   - Uses custom user agent from environment

## Core Functions

### 1. getWeatherData ([server.js:33-42](./server.js#L33-L42))
- Fetches data from National Weather Service API
- Simple wrapper with error handling
- **Potential Issue**: No retry mechanism for failed requests

### 2. extractLocation ([server.js:44-96](./server.js#L44-L96))
- Uses GPT-3.5-turbo to extract location from user message
- Returns standardized "City, ST" format or null
- **Code Smells**:
  - Hard-coded prompt could be moved to configuration
  - No caching of common locations

### 3. getCoordinatesForLocation ([server.js:99-154](./server.js#L99-L154))
- Converts location names to coordinates using OpenStreetMap
- Includes fallback mechanism for non-city locations
- **Bugs/Issues**:
  - Only handles "oregon" state name, should handle all states
  - No rate limiting for OpenStreetMap API
  - Potential memory leak with large responses

### 4. Main Chat Endpoint ([server.js:148-240](./server.js#L148-240))
- Handles POST requests to '/api/chat'
- Orchestrates the entire conversation flow
- Includes location image search and delivery
- **Fixed Issues**:
  1. Variable 'location' properly scoped and initialized
  2. Variable 'weatherData' initialized with default structure
  3. Variable 'coordinates' renamed to 'locationCoords'
  4. Added error handling for missing browser location
  5. Improved logging for debugging

## Error Handling

### Good Practices
- Detailed error logging with consistent format
- Error propagation to client with context
- Graceful fallbacks for all external services
- Proper variable initialization and scoping

### Areas for Improvement
1. Add request validation
2. Implement retry logic for API calls
3. Add rate limiting
4. Add request timeouts

## Security Considerations

### Current Measures
- API keys in environment variables
- CORS enabled
- Input validation for messages

### Recommended Improvements
1. Add rate limiting per IP
2. Implement request sanitization
3. Add API key rotation mechanism
4. Add request validation middleware

## Performance Considerations

### Current Optimizations
- Async/await for all API calls
- Fallback mechanisms for geocoding
- Efficient personality loading from file
- Parallel image and weather data fetching

### Potential Optimizations
1. Add caching layer for:
   - Weather data
   - Geocoding results
   - Common location extractions
2. Implement connection pooling
3. Add request queuing for rate limits

## Debugging Tips

### Key Log Points
1. Location extraction:
   ```javascript
   console.log('Extracting location from message:', message);
   ```
2. Geocoding:
   ```javascript
   console.log('Geocoding location:', locationName);
   ```
3. Weather data:
   ```javascript
   console.log('Weather API response:', response.data);
   ```

### Common Issues
1. "OpenAI API key is not configured"
   - Check .env file
   - Verify environment variables are loaded

2. "Geocoding Error"
   - Check OpenStreetMap API status
   - Verify location format

3. "Weather API Error"
   - Check National Weather Service API status
   - Verify coordinates format

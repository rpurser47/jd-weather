# JD Weather - Technical Documentation

## Project Files Overview

- [server.js](./server.js) - Express backend server handling weather data and chat functionality
- [client/src/App.js](./client/src/App.js) - React frontend implementing the chat interface
- [client/src/App.css](./client/src/App.css) - Styling for the chat interface with markdown support
- [client/src/index.js](./client/src/index.js) - React application entry point
- [package.json](./package.json) - Project dependencies and scripts
- [.env](./.env) - Environment variables configuration (not in repo)
- [jd_personality.txt](./jd_personality.txt) - JD's personality and response style configuration

## System Requirements

### Functional Requirements
1. Natural Language Weather Queries
   - Users can ask about weather conditions in natural language
   - System extracts location information from user queries
   - Supports US locations only
   - Provides current weather and forecast data

2. Location Handling
   - Extracts location from user messages using AI
   - Falls back to browser geolocation if no location is specified
   - Validates and geocodes locations to coordinates
   - Converts state codes to full names (e.g., 'NY' to 'New York')
   - Maintains consistent state naming across all responses

3. Weather Information
   - Provides real-time weather data from official sources
   - Includes current conditions and forecasts
   - Supports location-specific weather queries

### Non-Functional Requirements
1. Performance
   - Response time < 3 seconds for weather queries
   - Graceful handling of API rate limits
   - Smooth UI interactions

2. Security
   - Secure API key management
   - No exposure of sensitive data to client
   - CORS protection for API endpoints

3. Reliability
   - Graceful error handling
   - Fallback mechanisms for location services
   - Clear error messages to users

## Technology Stack

### Frontend
- **React** ([App.js](./client/src/App.js))
  - Chosen for its component-based architecture and efficient rendering
  - Provides excellent state management for chat interface
  - Markdown rendering for formatted responses
  - Location image display integration
  - Core components:
    - [State Management](./client/src/App.js#L13-L16) - Chat messages and UI state
    - [getCurrentLocation](./client/src/App.js#L27-L43) - Browser geolocation
    - [handleSubmit](./client/src/App.js#L45-L70) - Chat interaction handler
    - [Message Display](./client/src/App.js#L72-L137) - Markdown and image rendering

### Backend
- **Node.js/Express** ([server.js](./server.js))
  - Lightweight and fast server implementation
  - Easy integration with external APIs
  - Excellent async/await support for API calls
  - Personality configuration via external file
  - Core functions:
    - [extractLocation](./server.js#L44-L96) - Location extraction using GPT-3.5-turbo
    - [getCoordinatesForLocation](./server.js#L99-L154) - Geocoding using OpenStreetMap
    - [getWeatherData](./server.js#L33-L42) - Weather data fetching
    - [Chat endpoint](./server.js#L155-L279) - Main API integration point with image support

### External Services
1. **OpenAI API** ([OpenAI Client](./server.js#L11-L13))
   - GPT-3.5-turbo: Used for location extraction from user queries
   - GPT-4 Turbo: Main chatbot model for weather information and conversation
   - Models chosen for optimal balance of cost and performance
   - Personality-driven responses using JD's character
   - Context-aware weather information presentation

2. **Pexels API** ([Pexels Client](./server.js#L8-L10))
   - Location-based image search using full state names
   - Smart image selection prioritizing landscape photos
   - Quality scoring based on aspect ratio and resolution
   - Enhances chat responses with high-quality visual context

2. **National Weather Service API** ([Weather API Client](./server.js#L18-L23))
   - Official source of US weather data
   - Free and reliable service
   - Comprehensive weather information

3. **OpenStreetMap Nominatim API**
   - Geocoding service for location to coordinates
   - Free and open-source
   - Specific support for US locations

## Architecture Overview

### High-Level Architecture
```
[User Browser] <-> [React Frontend] <-> [Express Backend] <-> [External APIs]
```

### Data Flow
1. User enters a weather query
2. Frontend sends query to backend with geolocation
3. Backend processes:
   - Extracts location using OpenAI
   - Geocodes location to coordinates
   - Fetches weather data
   - Searches for location images
   - Generates response using GPT-4 and JD's personality
4. Response with weather data and images returned to frontend
5. Frontend renders markdown-formatted response with location image

## Key Code Components

### Backend (server.js)

1. **Location and State Handling**
```javascript
// State mapping for consistent naming
const stateMap = {
  'NY': 'New York',
  'CA': 'California',
  // ... all US states mapped
};

async function extractLocation(message) {
  // Uses OpenAI to extract standardized location from user message
  // Returns format: "City, ST" or null
}

// Convert state codes to full names
weatherData.state = stateMap[stateCode] || stateCode;
```

2. **Geocoding Service**
See [getCoordinatesForLocation](./server.js#L99-L154) in server.js for implementation details.

3. **Weather Data Retrieval**
See [getWeatherData](./server.js#L33-L42) in server.js for implementation details.

4. **Chat Endpoint**
See [Chat endpoint](./server.js#L155-L279) in server.js for implementation details.

### Frontend (App.js)

1. **Geolocation Handler**
See [getCurrentLocation](./client/src/App.js#L27-L43) in App.js for implementation details.

2. **Chat Interface**
```javascript
function App() {
  // Manages chat state and message history
  // Handles user input and API communication
  // Renders chat interface with loading states
}
```

### API between Frontend and Backend

1. **Chat Endpoint**
   - **URL**: `/api/chat`
   - **Method**: POST
   - **Request Body**:
     ```json
     {
       "message": "string",  // User's chat message
       "location": {        // Browser geolocation (optional)
         "lat": number,
         "lng": number
       }
     }
     ```
   - **Response Body**:
     ```json
     {
       "text": "string",     // AI response with weather info
       "locationImage": "string", // URL to city image
       "city": "string",     // Extracted city name
       "state": "string",    // Full state name (e.g., "New York")
       "requestedLocation": "string", // Original location request
       "browserLocation": {   // Original browser location
         "lat": number,
         "lng": number
       }
     }
     ```
   - **Error Response**:
     ```json
     {
       "error": "string"    // Error message if request fails
     }
     ```

## Error Handling

1. **Backend Errors**
   - API failures (OpenAI, Weather, Geocoding)
   - Location extraction failures
   - Invalid coordinates/locations

2. **Frontend Errors**
   - Network communication errors
   - Geolocation failures
   - Input validation

## Security Considerations

1. **API Key Management**
   - OpenAI API key stored in environment variables
   - Keys never exposed to frontend

2. **Rate Limiting**
   - Respects API rate limits
   - Implements exponential backoff for retries

3. **Input Validation**
   - Sanitizes user input
   - Validates coordinates and locations

## Future Improvements

1. **Performance**
   - Implement caching for weather data
   - Add request debouncing
   - Optimize location extraction

2. **Features**
   - Support for international locations
   - More detailed weather information
   - Historical weather data

3. **User Experience**
   - Offline support
   - Push notifications
   - Location suggestions

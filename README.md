# JD Weather

A charming weather application featuring JD, a gentle 90-year-old grandmother who loves sharing weather information with a personal touch. She provides current conditions and forecasts in her unique, warm style, often relating the weather to her memories from years past.

## Features
- Natural language weather queries using GPT-4
- Location detection from conversation or browser geolocation
- Full state name handling (converts "NY" to "New York")
- High-quality city images from Pexels API
- Real-time weather data from National Weather Service API
- Engaging grandmotherly personality
- Responsive chat interface with markdown support

## Prerequisites
1. Node.js and npm installed
2. OpenAI API key
3. Pexels API key
4. Internet connection for API access

## Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd client
   npm install
   ```
3. Create a `.env` file in the root directory with:
   ```
   OPENAI_API_KEY=your_openai_api_key
   PEXELS_API_KEY=your_pexels_api_key
   WEATHER_USER_AGENT=your_email_address_for_api_requests
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Technologies Used
- React (Frontend)
  - Responsive chat interface
  - Geolocation support
  - Markdown rendering
- Node.js/Express (Backend)
  - RESTful API endpoints
  - External API integration
  - Natural language processing
- External APIs:
  - OpenAI GPT-4 for natural language understanding
  - National Weather Service for accurate weather data
  - Pexels API for location imagery
  - OpenStreetMap Nominatim for geocoding

## Documentation
For detailed technical information, please refer to:
- [Technical Documentation](./TECHNICAL.md) - System architecture and API details
- [Server Documentation](./server.js.md) - Backend implementation details
- [App Documentation](./client/src/App.js.md) - Frontend implementation details

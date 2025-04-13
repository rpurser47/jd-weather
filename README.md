# JD Weather

A charming weather application featuring JD, a gentle 90-year-old grandmother who loves sharing weather information with a personal touch. She provides current conditions and forecasts in her unique, warm style, often relating the weather to her memories from years past.

## Features
- Real-time weather information using National Weather Service API
- Natural language conversation using OpenAI's ChatGPT
- Current weather conditions
- Weather forecasts
- Historical weather data

## Prerequisites
1. Node.js and npm installed
2. OpenAI API key
3. Internet connection for API access

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
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Technologies Used
- React (Frontend)
- Node.js/Express (Backend)
- OpenAI API
- National Weather Service API

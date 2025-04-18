# JD Weather App Observability

This directory contains the observability setup for the JD Weather application using OpenTelemetry.

## Overview

We've implemented a simplified yet effective observability solution with:

1. **Application Instrumentation** - Added OpenTelemetry to track:
   - HTTP requests and responses
   - API calls to external services (Weather API, OpenAI)
   - Custom business logic and functions
   - Error tracking

2. **Metrics Collection** - Capturing:
   - Request counts by endpoint
   - API latency as a histogram
   - Error rates

3. **Console-based Tracing** - Outputting:
   - End-to-end request flow to the console
   - Details on API call performance
   - Error information for troubleshooting

## Components

- **OpenTelemetry SDK**: The core instrumentation library
- **Console Exporters**: Simple exporters that output telemetry to the console
- **Custom metrics**: Request counters and latency histograms

## Getting Started

### 1. Start the Observability Environment

```powershell
# From the project root
npm run observability
```

This will set up the environment variables and create a log directory for telemetry data.

### 2. Start the Application with Tracing Enabled

In a separate terminal:

```powershell
# Start both the observability environment and the application together
npm run dev:observe

# Or start just the application if you've already started observability
npm run dev
```

The application is instrumented with OpenTelemetry and will automatically output telemetry data to the console.

### 3. View Traces and Metrics

- **Console Output**: Watch your application's console output to see traces and metrics
- **Log Files**: Check the `observability/logs` directory for additional telemetry data

## Understanding the Data

### Traces

Each trace represents a complete request flow through the system. Key spans include:

- `api.weather.gov` - Calls to the National Weather Service API
- `openai.extract_location` - Calls to OpenAI for location extraction
- `geocoding.location` - Location geocoding process

Within each span, you can see:
- Duration
- Success/error status
- Timestamps
- Custom attributes

### Metrics

The application tracks these key metrics:

- `jd_weather_requests` - Counter of requests by endpoint
- `jd_weather_api_latency` - Histogram of API call latencies

## Customizing the Setup

You can modify the tracing behavior in `tracing.js` in the root directory. Key functions:

- `createSpan()` - Used to create custom spans for any operation
- `incrementRequestCounter()` - Used to count specific types of requests

## Advanced Configuration

You can modify the instrumentation in these key ways:

1. **Change Export Interval**: Adjust the `exportIntervalMillis` in `tracing.js` to control how frequently metrics are reported
2. **Add More Instrumentation**: Identify critical code paths and add more `createSpan()` calls
3. **Custom Attributes**: Add more detailed attributes to spans for deeper analysis

## Troubleshooting

If you don't see telemetry data in the console:

1. Verify the application is running with the OpenTelemetry module loaded (check for 'Tracing initialized' message)
2. Ensure you're generating traffic by using the application
3. Check for any errors in the application startup logs

## Resources

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)

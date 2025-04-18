# JD Weather App Observability Implementation

This document provides an overview of how we've implemented observability in the JD Weather application using OpenTelemetry with Jaeger and Prometheus.

## What We've Implemented

1. **Core Instrumentation**
   - Added OpenTelemetry SDK to the application
   - Configured automatic instrumentation for HTTP, Express, and other common libraries
   - Added custom manual instrumentation for critical business logic
   - Set up a complete observability stack with Docker
   
2. **Telemetry Types**
   - **Traces**: End-to-end tracking of requests through the system (Jaeger)
   - **Metrics**: Counts and measurements of application activities (Prometheus)
   - **Visualization**: Dashboards for metrics and traces (Grafana)
   - **Context propagation**: Maintains context across async operations

3. **Key Instrumented Areas**
   - Weather API calls
   - OpenAI API calls for location extraction
   - Geocoding operations
   - HTTP request/response handling

## How It Works

### Telemetry Flow

1. **Generation**: Instrumentation code generates telemetry data
2. **Collection**: Data is captured by the OpenTelemetry SDK
3. **Export**: Data is exported to the OpenTelemetry Collector via OTLP
4. **Processing**: The collector processes and forwards data to backends
5. **Storage**: Jaeger stores traces, Prometheus stores metrics
6. **Visualization**: Jaeger UI and Grafana provide visualization

### Key Files

- `tracing.js`: Core OpenTelemetry setup and configuration
- `server.js`: Contains instrumented API endpoints and business logic
- `observability/docker-compose.yml`: Docker configuration for the observability stack
- `observability/otel-collector-config.yaml`: OpenTelemetry Collector configuration
- `observability/prometheus.yml`: Prometheus configuration

## Using the Observability Features

### Starting the Observability Stack

```bash
# Start the observability stack (Jaeger, Prometheus, Grafana, OpenTelemetry Collector)
cd observability && docker-compose up -d

# Start the application with observability
npm run dev
```

### Accessing Observability Tools

1. **Jaeger UI** - View distributed traces
   - URL: http://localhost:16686
   - Select "jd-weather-service" from the service dropdown
   - Search for traces by operation name, tags, or time range
   - Click on any trace to see detailed spans and timing

2. **Prometheus** - Query and graph metrics
   - URL: http://localhost:9090
   - Go to the "Graph" tab to query metrics
   - Search for metrics like `jd_weather_requests` or `jd_weather_api_latency`

3. **Grafana** - Create dashboards
   - URL: http://localhost:3001
   - Login: admin/admin
   - Create dashboards using Prometheus as a data source

## Adding More Instrumentation

To add more observability to other parts of the application:

1. **Wrap operations in spans**:
   ```javascript
   await tracing.createSpan('operation_name', { attributeKey: value }, async () => {
     // code to be traced
   });
   ```

2. **Count events**:
   ```javascript
   tracing.incrementRequestCounter(endpoint);
   ```

3. **Measure durations**:
   ```javascript
   // The span will automatically record the duration
   await tracing.createSpan('api_call', { endpoint }, async () => {
     // API call or operation to measure
   });
   ```

## Implementation Details

### OpenTelemetry SDK Configuration

The application uses the OpenTelemetry Node.js SDK with:

- **Auto-instrumentation** for common libraries
- **OTLP exporters** for sending data to the collector
- **Resource attributes** to identify the service
- **Custom spans** for manual instrumentation

### Docker-based Observability Stack

The observability stack includes:

- **Jaeger**: For distributed tracing storage and UI
- **Prometheus**: For metrics collection and querying
- **Grafana**: For metrics visualization and dashboards
- **OpenTelemetry Collector**: For receiving, processing, and exporting telemetry data

## Next Steps

To further enhance the observability implementation:

1. **Create custom dashboards** in Grafana for key metrics
2. **Set up alerts** based on metrics thresholds
3. **Add more custom metrics** for business-critical operations
4. **Implement sampling strategies** for high-volume production use
5. **Add log correlation** to connect logs with traces
6. **Set up user journey tracking** to understand user behavior

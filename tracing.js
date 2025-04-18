// OpenTelemetry instrumentation for Node.js with Jaeger and Prometheus
const opentelemetry = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { Resource } = require('@opentelemetry/resources');
const { trace, metrics, diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');

// Set up diagnostic logging (minimal)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

console.log('Initializing OpenTelemetry with Jaeger and Prometheus');

try {
  // Define service name and other attributes
  const sdk = new opentelemetry.NodeSDK({
    resource: new Resource({
      'service.name': 'jd-weather-service',
      'service.version': '1.0.0',
      'environment': 'development',
    }),
    traceExporter: new OTLPTraceExporter({
      url: 'http://localhost:4318/v1/traces',
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: 'http://localhost:4318/v1/metrics',
      }),
      exportIntervalMillis: 5000, // Export metrics every 5 seconds
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  // Initialize the SDK and register with the OpenTelemetry API
  sdk.start()
    .then(() => console.log('OpenTelemetry initialized with Jaeger and Prometheus exporters'))
    .catch((error) => console.error('Error initializing OpenTelemetry', error));

  // Gracefully shut down the SDK on process exit
  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('OpenTelemetry SDK shut down successfully'))
      .catch((error) => console.error('Error shutting down OpenTelemetry SDK', error))
      .finally(() => process.exit(0));
  });
} catch (error) {
  console.error('Failed to initialize OpenTelemetry:', error);
}

// Create a tracer and meter for manual instrumentation
const tracer = trace.getTracer('jd-weather-tracer');
const meter = metrics.getMeter('jd-weather-metrics');

// Create request counter
const requestCounter = meter.createCounter('jd_weather_requests', {
  description: 'Counts the number of requests received',
});

// Create API latency histogram
const apiLatencyHistogram = meter.createHistogram('jd_weather_api_latency', {
  description: 'Measures the latency of API calls',
  unit: 'ms',
});

/**
 * Creates a span for tracking operations manually
 * @param {string} name - The name of the span
 * @param {object} attributes - Attributes to add to the span
 * @param {function} operation - The operation to track
 * @returns {Promise<any>} - The result of the operation
 */
async function createSpan(name, attributes, operation) {
  return await tracer.startActiveSpan(name, async (span) => {
    try {
      // Set attributes on the span
      span.setAttributes(attributes);
      
      const startTime = Date.now();
      const result = await operation();
      const endTime = Date.now();
      
      // Record latency for API calls if it's an API operation
      if (name.includes('api')) {
        apiLatencyHistogram.record(endTime - startTime, attributes);
      }
      
      return result;
    } catch (error) {
      // Record error information on the span
      span.recordException(error);
      span.setStatus({
        code: trace.SpanStatusCode.ERROR,
        message: error.message,
      });
      throw error;
    } finally {
      // End the span when the operation is complete
      span.end();
    }
  });
}

/**
 * Increments the request counter for a specific endpoint
 * @param {string} endpoint - The endpoint that was requested
 */
function incrementRequestCounter(endpoint) {
  requestCounter.add(1, {
    endpoint,
  });
}

// Export the tracing functions
module.exports = {
  tracing: {
    createSpan,
    incrementRequestCounter,
  },
  metrics: {
    requestCounter,
    apiLatencyHistogram,
  }
};

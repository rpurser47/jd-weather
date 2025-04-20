// OpenTelemetry instrumentation for JD Weather App with Jaeger and Prometheus

// Import required OpenTelemetry components
const { trace, metrics, context } = require('@opentelemetry/api');

// Create a simple logger for traces and metrics with OTLP export capability
class EnhancedInstrumentation {
  constructor() {
    this.requestCounts = {};
    this.apiLatencies = {};
    
    // Log counts and latencies periodically
    setInterval(() => {
      this._logMetrics();
      this._sendMetricsToCollector();
    }, 30000); // Log every 30 seconds
    
    console.log('OpenTelemetry initialized with Jaeger and Prometheus');
    
    // Try to send a test metric to the collector
    this._sendTestMetric();
  }
  
  // Send a test metric to the collector to verify connectivity
  async _sendTestMetric() {
    try {
      const response = await fetch('http://localhost:4318/v1/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "resourceMetrics": [{
            "resource": {
              "attributes": [{
                "key": "service.name",
                "value": { "stringValue": "jd-weather-service" }
              }]
            },
            "scopeMetrics": [{
              "metrics": [{
                "name": "test.metric",
                "sum": {
                  "dataPoints": [{
                    "asInt": "1",
                    "timeUnixNano": `${Date.now() * 1000000}`
                  }]
                }
              }]
            }]
          }]
        })
      });
      
      if (response.ok) {
        console.log('Successfully sent test metric to OpenTelemetry Collector');
      } else {
        console.error('Failed to send test metric to OpenTelemetry Collector:', await response.text());
      }
    } catch (error) {
      console.error('Error sending test metric to OpenTelemetry Collector:', error.message);
    }
  }
  
  // Send metrics to the OpenTelemetry Collector
  async _sendMetricsToCollector() {
    try {
      // Convert request counts to OTLP format
      const dataPoints = Object.entries(this.requestCounts).map(([endpoint, count]) => ({
        "attributes": [{ "key": "endpoint", "value": { "stringValue": endpoint } }],
        "asInt": String(count),
        "timeUnixNano": `${Date.now() * 1000000}`
      }));
      
      if (dataPoints.length === 0) return;
      
      const payload = {
        "resourceMetrics": [{
          "resource": {
            "attributes": [{
              "key": "service.name",
              "value": { "stringValue": "jd-weather-service" }
            }]
          },
          "scopeMetrics": [{
            "metrics": [{
              "name": "http.requests",
              "sum": { "dataPoints": dataPoints }
            }]
          }]
        }]
      };
      
      const response = await fetch('http://localhost:4318/v1/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        console.log('Successfully sent metrics to OpenTelemetry Collector');
      } else {
        console.error('Failed to send metrics to OpenTelemetry Collector:', await response.text());
      }
    } catch (error) {
      console.error('Error sending metrics to OpenTelemetry Collector:', error.message);
    }
  }
  
  // Send a trace to the OpenTelemetry Collector
  async _sendTraceToCollector(name, attributes, startTime, endTime, status = 'OK', errorMessage = null) {
    try {
      const traceId = this._generateTraceId();
      const spanId = this._generateSpanId();
      
      const payload = {
        "resourceSpans": [{
          "resource": {
            "attributes": [{
              "key": "service.name",
              "value": { "stringValue": "jd-weather-service" }
            }]
          },
          "scopeSpans": [{
            "spans": [{
              "traceId": traceId,
              "spanId": spanId,
              "name": name,
              "kind": 1, // SPAN_KIND_INTERNAL
              "startTimeUnixNano": `${startTime * 1000000}`,
              "endTimeUnixNano": `${endTime * 1000000}`,
              "attributes": Object.entries(attributes).map(([key, value]) => ({
                "key": key,
                "value": { "stringValue": String(value) }
              })),
              "status": {
                "code": status === 'OK' ? 1 : 2, // 1 = OK, 2 = ERROR
                "message": errorMessage || ""
              }
            }]
          }]
        }]
      };
      
      const response = await fetch('http://localhost:4318/v1/traces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        console.log(`Successfully sent trace "${name}" to OpenTelemetry Collector`);
      } else {
        console.error(`Failed to send trace "${name}" to OpenTelemetry Collector:`, await response.text());
      }
    } catch (error) {
      console.error(`Error sending trace "${name}" to OpenTelemetry Collector:`, error.message);
    }
  }
  
  // Generate a random trace ID (16 bytes)
  _generateTraceId() {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }
  
  // Generate a random span ID (8 bytes)
  _generateSpanId() {
    return Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  // Create a span and track an operation
  async createSpan(name, attributes, operation) {
    const startTime = Date.now();
    console.log(`[TRACE] Starting: ${name}`, attributes);
    
    try {
      const result = await operation();
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`[TRACE] Completed: ${name} in ${duration}ms`, attributes);
      
      // Track API latencies if it's an API operation
      if (name.includes('api')) {
        if (!this.apiLatencies[name]) {
          this.apiLatencies[name] = [];
        }
        this.apiLatencies[name].push(duration);
      }
      
      // Send trace to OpenTelemetry Collector
      this._sendTraceToCollector(name, attributes, startTime, endTime);
      
      return result;
    } catch (error) {
      const endTime = Date.now();
      console.error(`[TRACE] Error in ${name}:`, error.message);
      
      // Send error trace to OpenTelemetry Collector
      this._sendTraceToCollector(name, attributes, startTime, endTime, 'ERROR', error.message);
      
      throw error;
    }
  }
  
  // Increment request counter for a specific endpoint
  incrementRequestCounter(endpoint) {
    if (!this.requestCounts[endpoint]) {
      this.requestCounts[endpoint] = 0;
    }
    this.requestCounts[endpoint]++;
    console.log(`[METRIC] Request to ${endpoint}, count: ${this.requestCounts[endpoint]}`);
  }
  
  // Log metrics to console
  _logMetrics() {
    console.log('\n[METRICS SUMMARY]');
    console.log('Request counts by endpoint:', this.requestCounts);
    
    // Calculate average latencies
    const avgLatencies = {};
    for (const [api, latencies] of Object.entries(this.apiLatencies)) {
      if (latencies.length > 0) {
        const sum = latencies.reduce((a, b) => a + b, 0);
        avgLatencies[api] = Math.round(sum / latencies.length);
      }
    }
    console.log('Average API latencies (ms):', avgLatencies);
  }
}

// Create an instance of our enhanced instrumentation
const enhancedTracing = new EnhancedInstrumentation();

// Export the tracing functions
module.exports = {
  tracing: {
    createSpan: (name, attributes, operation) => enhancedTracing.createSpan(name, attributes, operation),
    incrementRequestCounter: (endpoint) => enhancedTracing.incrementRequestCounter(endpoint)
  },
  metrics: {
    // Expose the metrics interface
    requestCounter: {
      add: (count, attributes) => {
        enhancedTracing.incrementRequestCounter(attributes.endpoint || 'unknown');
      }
    },
    apiLatencyHistogram: {
      record: (duration, attributes) => {
        console.log(`[METRIC] API latency: ${duration}ms`, attributes);
      }
    }
  }
};

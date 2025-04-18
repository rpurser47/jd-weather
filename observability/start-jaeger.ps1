# PowerShell script to start Jaeger
$env:COLLECTOR_ZIPKIN_HTTP_PORT = "9411"
npx jaeger-standalone@latest

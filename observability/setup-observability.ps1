# PowerShell script to set up OpenTelemetry Collector, Jaeger, and Prometheus

# Install Jaeger
Write-Host "Setting up Jaeger..."
npm install -g jaeger-standalone

# Install Prometheus client for NodeJS
Write-Host "Setting up Prometheus client..."
npm install prom-client --save

# Create a script to run everything
Write-Host "Creating start scripts..."

# Create start-observability script
$startScriptContent = @"
# Start Jaeger
Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command `"npx jaeger-standalone`"" -WindowStyle Normal

# Wait for Jaeger to initialize
Start-Sleep -Seconds 5

Write-Host "Jaeger UI is available at: http://localhost:16686"
Write-Host "To view your application traces, restart your Node.js application with the OpenTelemetry instrumentation enabled."
"@

Set-Content -Path "d:\localProjects\jd-weather\observability\start-observability.ps1" -Value $startScriptContent

Write-Host "Setup complete! Run .\observability\start-observability.ps1 to start the observability stack"

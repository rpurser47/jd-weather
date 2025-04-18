# PowerShell script to start all observability components
Write-Host "Starting Observability Stack for JD Weather App" -ForegroundColor Green

# Create a temporary directory for Jaeger data if it doesn't exist
$jaegerDataDir = Join-Path $PSScriptRoot "jaeger-data"
if (-not (Test-Path $jaegerDataDir)) {
    New-Item -ItemType Directory -Path $jaegerDataDir | Out-Null
    Write-Host "Created Jaeger data directory at $jaegerDataDir" -ForegroundColor Yellow
}

# Start Jaeger as a background process
Write-Host "Starting Jaeger (Tracing Backend)..." -ForegroundColor Cyan
$env:SPAN_STORAGE_TYPE = "memory"
$jaegerProcess = Start-Process -FilePath "npx" -ArgumentList "jaeger-standalone" -NoNewWindow -PassThru -WorkingDirectory $PSScriptRoot

Write-Host "Jaeger UI will be available at: http://localhost:16686" -ForegroundColor Green
Write-Host "The OpenTelemetry trace exporter is configured to send traces to: http://localhost:4318/v1/traces" -ForegroundColor Cyan

Write-Host "`nTo view traces:" -ForegroundColor Magenta
Write-Host "1. Start the application with 'npm run dev'" -ForegroundColor White
Write-Host "2. Generate some traffic by using the application" -ForegroundColor White
Write-Host "3. Open Jaeger UI at http://localhost:16686 and select 'jd-weather-service' from the Service dropdown" -ForegroundColor White

Write-Host "`nPress Ctrl+C to stop the observability stack" -ForegroundColor Yellow
try {
    # Keep the script running until user presses Ctrl+C
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    # Clean up processes when script is terminated
    if ($jaegerProcess -and !$jaegerProcess.HasExited) {
        Write-Host "Stopping Jaeger..." -ForegroundColor Cyan
        Stop-Process -Id $jaegerProcess.Id -Force
    }
    
    Write-Host "Observability stack stopped." -ForegroundColor Green
}

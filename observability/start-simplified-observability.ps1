# PowerShell script to start a simplified observability stack
Write-Host "Starting Simplified Observability Stack for JD Weather App" -ForegroundColor Green

# Create a directory for logs
$logDir = Join-Path $PSScriptRoot "logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
    Write-Host "Created logs directory at $logDir" -ForegroundColor Yellow
}

$logFile = Join-Path $logDir "telemetry_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
Write-Host "Telemetry will be logged to: $logFile" -ForegroundColor Cyan

# Set environment variables for the application to use file-based exporters
$env:OTEL_EXPORTER_OTLP_ENDPOINT = "file://$logFile"
$env:OTEL_TRACES_EXPORTER = "console"
$env:OTEL_METRICS_EXPORTER = "console"
$env:OTEL_LOGS_EXPORTER = "console"

Write-Host "`nTo view telemetry data:" -ForegroundColor Magenta
Write-Host "1. Start the application with 'npm run dev' in a separate terminal" -ForegroundColor White
Write-Host "2. Generate some traffic by using the application" -ForegroundColor White
Write-Host "3. Check the console output of your application server for telemetry data" -ForegroundColor White
Write-Host "4. Check the log file at $logFile for additional telemetry data" -ForegroundColor White

Write-Host "`nPress Ctrl+C to stop this script." -ForegroundColor Yellow
Write-Host "The environment variables will remain active for this session." -ForegroundColor Yellow

# Keep the script running until user presses Ctrl+C
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "Observability environment variables cleared." -ForegroundColor Green
}

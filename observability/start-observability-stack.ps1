# PowerShell script to start the observability stack using Docker Compose
Write-Host "Starting JD Weather Observability Stack..." -ForegroundColor Green

# Navigate to the observability directory
Set-Location -Path $PSScriptRoot

# Start the Docker Compose stack
Write-Host "Starting Docker containers for Jaeger, Prometheus, and Grafana..." -ForegroundColor Cyan
docker-compose up -d

Write-Host "`nObservability stack is now running!" -ForegroundColor Green
Write-Host "You can access the following services:" -ForegroundColor Yellow
Write-Host "- Jaeger UI: http://localhost:16686" -ForegroundColor White
Write-Host "- Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "- Grafana: http://localhost:3001 (admin/admin)" -ForegroundColor White

Write-Host "`nTo stop the stack, run: docker-compose down" -ForegroundColor Magenta

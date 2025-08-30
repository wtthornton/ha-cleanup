# Dashboard Deployment Script
Write-Host "Starting dashboard deployment..." -ForegroundColor Green

# Dashboard files to deploy
$dashboardFiles = @(
    "01_data_ingestion_collection_dashboard.json",
    "02_system_health_performance_dashboard.json", 
    "03_raw_data_explorer_dashboard.json",
    "04_entity_performance_analytics_dashboard.json",
    "05_home_occupancy_security_dashboard.json",
    "06_energy_management_sustainability_dashboard.json",
    "07_automation_service_performance_dashboard.json",
    "08_device_communication_network_health_dashboard.json",
    "09_predictive_maintenance_anomaly_detection_dashboard.json",
    "10_data_quality_validation_dashboard.json"
)

$successCount = 0
$totalCount = $dashboardFiles.Count

Write-Host "Deploying $totalCount dashboards..." -ForegroundColor Cyan

foreach ($file in $dashboardFiles) {
    $filePath = "grafana\provisioning\dashboards\$file"
    
    Write-Host "Deploying $file..." -ForegroundColor Yellow
    
    if (Test-Path $filePath) {
        try {
            # Read dashboard JSON
            $dashboardJson = Get-Content $filePath -Raw | ConvertFrom-Json
            
            # Ensure production naming
            $dashboardJson.title = "PROD: $($dashboardJson.title)"
            
            # Prepare payload
            $payload = @{
                dashboard = $dashboardJson
                overwrite = $true
                folderId = 0
            } | ConvertTo-Json -Depth 10
            
            # Deploy dashboard
            $response = Invoke-RestMethod -Uri "http://localhost:3000/api/dashboards/db" -Method Post -Body $payload -ContentType "application/json" -Headers @{"Authorization" = "Basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("admin:admin"))}
            
            Write-Host "Successfully deployed $($dashboardJson.title)" -ForegroundColor Green
            $successCount++
            
        } catch {
            Write-Host "Failed to deploy $file. Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "Dashboard file not found: $filePath" -ForegroundColor Red
    }
}

Write-Host "Dashboard deployment summary:" -ForegroundColor Green
Write-Host "Successfully deployed: $successCount/$totalCount" -ForegroundColor Green
Write-Host "Failed: $($totalCount - $successCount)" -ForegroundColor Red

if ($successCount -eq $totalCount) {
    Write-Host "All dashboards deployed successfully!" -ForegroundColor Green
    Write-Host "Access Grafana at: http://localhost:3000" -ForegroundColor Cyan
} else {
    Write-Host "Some dashboards failed to deploy!" -ForegroundColor Red
}

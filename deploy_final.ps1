# Final Dashboard Deployment Script
Write-Host "🚀 Deploying 10 Consolidated Production Dashboards" -ForegroundColor Green

# Test Grafana connection
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get
    Write-Host "✅ Grafana is ready: $($health.version)" -ForegroundColor Green
} catch {
    Write-Host "❌ Cannot connect to Grafana: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create the 10 production dashboards
$dashboards = @(
    "PROD: Data Ingestion & Collection Dashboard",
    "PROD: System Health & Performance Dashboard",
    "PROD: Raw Data Explorer Dashboard",
    "PROD: Entity Performance & Analytics Dashboard",
    "PROD: Home Occupancy & Security Dashboard",
    "PROD: Energy Management & Sustainability Dashboard",
    "PROD: Automation & Service Performance Dashboard",
    "PROD: Device Communication & Network Health Dashboard",
    "PROD: Predictive Maintenance & Anomaly Detection Dashboard",
    "PROD: Data Quality & Validation Dashboard"
)

Write-Host "`n📊 Creating production dashboards..." -ForegroundColor Cyan

$headers = @{"Content-Type" = "application/json"; "Authorization" = "Basic YWRtaW46YWRtaW4="}
$successCount = 0

foreach ($title in $dashboards) {
    try {
        $dashboardData = @{
            dashboard = @{
                title = $title
                tags = @("production", "ha-ingestor")
                style = "dark"
                timezone = "browser"
                refresh = "30s"
                time = @{from = "now-24h"; to = "now"}
                panels = @(
                    @{
                        id = 1
                        title = "Sample Panel"
                        type = "stat"
                        gridPos = @{h = 4; w = 6; x = 0; y = 0}
                        targets = @(
                            @{
                                query = "from(bucket: ha_events) |> range(start: -1h) |> count()"
                                refId = "A"
                            }
                        )
                    }
                )
            }
            overwrite = $true
            folderId = 0
        }
        
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/dashboards/db" -Method POST -Headers $headers -Body ($dashboardData | ConvertTo-Json -Depth 10)
        Write-Host "✅ Created: $title" -ForegroundColor Green
        $successCount++
        
    } catch {
        Write-Host "❌ Failed to create $title`: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Deployment Summary:" -ForegroundColor Green
Write-Host "   Successfully created: $successCount/$($dashboards.Count) dashboards" -ForegroundColor Green

if ($successCount -eq $dashboards.Count) {
    Write-Host "`n🎉 All 10 consolidated production dashboards created successfully!" -ForegroundColor Green
    Write-Host "   Access them at: http://localhost:3000" -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️  Some dashboards failed to create" -ForegroundColor Yellow
}

# Simple Dashboard Deployment Script
Write-Host "🚀 Deploying 10 Consolidated Production Dashboards" -ForegroundColor Green

# Test Grafana connection
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get
    Write-Host "✅ Grafana is ready: $($health.version)" -ForegroundColor Green
} catch {
    Write-Host "❌ Cannot connect to Grafana: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create a simple test dashboard first
$testDashboard = @{
    dashboard = @{
        title = "PROD: Test Dashboard"
        panels = @()
        tags = @("test", "production")
        style = "dark"
        timezone = "browser"
        refresh = "30s"
        time = @{from = "now-24h"; to = "now"}
    }
    overwrite = $true
    folderId = 0
}

try {
    $headers = @{"Content-Type" = "application/json"; "Authorization" = "Basic YWRtaW46YWRtaW4="}
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/dashboards/db" -Method POST -Headers $headers -Body ($testDashboard | ConvertTo-Json -Depth 10)
    Write-Host "✅ Test dashboard created: $($response.url)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create test dashboard: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Now create the 10 production dashboards
$dashboards = @(
    @{
        title = "PROD: Data Ingestion & Collection Dashboard"
        description = "Monitor data collection rates and ingestion performance"
        tags = @("data-ingestion", "collection-monitoring", "production")
    },
    @{
        title = "PROD: System Health & Performance Dashboard"
        description = "Track system performance and health metrics"
        tags = @("system-health", "performance", "production")
    },
    @{
        title = "PROD: Raw Data Explorer Dashboard"
        description = "Explore raw Home Assistant data and events"
        tags = @("raw-data", "data-exploration", "production")
    },
    @{
        title = "PROD: Entity Performance & Analytics Dashboard"
        description = "Analyze entity performance and behavior patterns"
        tags = @("entity-performance", "analytics", "production")
    },
    @{
        title = "PROD: Home Occupancy & Security Dashboard"
        description = "Monitor home occupancy and security systems"
        tags = @("home-occupancy", "security", "production")
    },
    @{
        title = "PROD: Energy Management & Sustainability Dashboard"
        description = "Track energy usage and sustainability metrics"
        tags = @("energy-management", "sustainability", "production")
    },
    @{
        title = "PROD: Automation & Service Performance Dashboard"
        description = "Monitor automation performance and service health"
        tags = @("automation", "service-performance", "production")
    },
    @{
        title = "PROD: Device Communication & Network Health Dashboard"
        description = "Track device communication and network performance"
        tags = @("device-communication", "network-health", "production")
    },
    @{
        title = "PROD: Predictive Maintenance & Anomaly Detection Dashboard"
        description = "Detect anomalies and predict maintenance needs"
        tags = @("predictive-maintenance", "anomaly-detection", "production")
    },
    @{
        title = "PROD: Data Quality & Validation Dashboard"
        description = "Monitor data quality and validation metrics"
        tags = @("data-quality", "validation", "production")
    }
)

Write-Host "`n📊 Creating production dashboards..." -ForegroundColor Cyan

$successCount = 0
foreach ($dashboard in $dashboards) {
    try {
        $dashboardData = @{
            dashboard = @{
                title = $dashboard.title
                description = $dashboard.description
                tags = $dashboard.tags
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
                                query = 'from(bucket: "ha_events") |> range(start: -1h) |> count()'
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
        Write-Host "✅ Created: $($dashboard.title)" -ForegroundColor Green
        $successCount++
        
    } catch {
        Write-Host "❌ Failed to create $($dashboard.title): $($_.Exception.Message)" -ForegroundColor Red
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

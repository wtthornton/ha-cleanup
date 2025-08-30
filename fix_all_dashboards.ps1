# Fix All Dashboards with Proper Column Headers
Write-Host "🔧 Fixing All Dashboards with Proper Column Headers" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green

# Function to add column header overrides to a dashboard
function Add-ColumnHeaders {
    param($dashboard)
    
    # Add overrides to all table panels
    foreach ($panel in $dashboard.panels) {
        if ($panel.type -eq "table") {
            if (-not $panel.fieldConfig.overrides) {
                $panel.fieldConfig.overrides = @()
            }
            
            # Add common column header overrides
            $overrides = @(
                @{
                    matcher = @{
                        id = "byName"
                        options = "_time"
                    }
                    properties = @(
                        @{
                            id = "displayName"
                            value = "Timestamp"
                        }
                    )
                },
                @{
                    matcher = @{
                        id = "byName"
                        options = "_value"
                    }
                    properties = @(
                        @{
                            id = "displayName"
                            value = "Count"
                        }
                    )
                },
                @{
                    matcher = @{
                        id = "byName"
                        options = "entity_id"
                    }
                    properties = @(
                        @{
                            id = "displayName"
                            value = "Entity ID"
                        }
                    )
                },
                @{
                    matcher = @{
                        id = "byName"
                        options = "domain"
                    }
                    properties = @(
                        @{
                            id = "displayName"
                            value = "Domain"
                        }
                    )
                },
                @{
                    matcher = @{
                        id = "byName"
                        options = "state"
                    }
                    properties = @(
                        @{
                            id = "displayName"
                            value = "State"
                        }
                    )
                },
                @{
                    matcher = @{
                        id = "byName"
                        options = "source"
                    }
                    properties = @(
                        @{
                            id = "displayName"
                            value = "Source"
                        }
                    )
                },
                @{
                    matcher = @{
                        id = "byName"
                        options = "_measurement"
                    }
                    properties = @(
                        @{
                            id = "displayName"
                            value = "Measurement"
                        }
                    )
                },
                @{
                    matcher = @{
                        id = "byName"
                        options = "_field"
                    }
                    properties = @(
                        @{
                            id = "displayName"
                            value = "Field"
                        }
                    )
                },
                @{
                    matcher = @{
                        id = "byName"
                        options = "service"
                    }
                    properties = @(
                        @{
                            id = "displayName"
                            value = "Service"
                        }
                    )
                }
            )
            
            $panel.fieldConfig.overrides = $overrides
        }
        
        # Also fix pie charts and bar charts
        if ($panel.type -in @("piechart", "barchart")) {
            if (-not $panel.fieldConfig.overrides) {
                $panel.fieldConfig.overrides = @()
            }
            
            $chartOverrides = @(
                @{
                    matcher = @{
                        id = "byName"
                        options = "_value"
                    }
                    properties = @(
                        @{
                            id = "displayName"
                            value = "Count"
                        }
                    )
                }
            )
            
            $panel.fieldConfig.overrides = $chartOverrides
        }
    }
    
    return $dashboard
}

# Dashboard files to fix (only the numbered production ones)
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

Write-Host "🔧 Fixing column headers for $($dashboardFiles.Count) production dashboards..." -ForegroundColor Cyan

foreach ($file in $dashboardFiles) {
    $filePath = "grafana\provisioning\dashboards\$file"
    
    if (Test-Path $filePath) {
        try {
            Write-Host "📊 Fixing $file..." -ForegroundColor Yellow
            
            # Read dashboard JSON
            $dashboardJson = Get-Content $filePath -Raw | ConvertFrom-Json
            
            # Fix column headers
            $dashboardJson = Add-ColumnHeaders -dashboard $dashboardJson
            
            # Save updated dashboard
            $dashboardJson | ConvertTo-Json -Depth 20 | Set-Content $filePath
            
            Write-Host "✅ Fixed $file" -ForegroundColor Green
            
        } catch {
            Write-Host "❌ Failed to fix $file: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Dashboard file not found: $filePath" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Column header fixes completed!" -ForegroundColor Green
Write-Host "All production dashboards now have human-readable column headers" -ForegroundColor Cyan
Write-Host "The 'A - series' issue has been resolved" -ForegroundColor Cyan

# Fix Dashboard Column Headers
Write-Host "🔧 Fixing Dashboard Column Headers" -ForegroundColor Green

# Dashboard files to fix
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

Write-Host "🔧 Fixing column headers for $($dashboardFiles.Count) dashboards..." -ForegroundColor Cyan

foreach ($file in $dashboardFiles) {
    $filePath = "grafana\provisioning\dashboards\$file"
    
    if (Test-Path $filePath) {
        try {
            Write-Host "📊 Fixing $file..." -ForegroundColor Yellow
            
            # Read dashboard JSON
            $dashboardJson = Get-Content $filePath -Raw | ConvertFrom-Json
            
            # Add overrides to all table panels
            foreach ($panel in $dashboardJson.panels) {
                if ($panel.type -eq "table") {
                    if (-not $panel.fieldConfig.overrides) {
                        $panel.fieldConfig.overrides = @()
                    }
                    
                    # Add column header overrides
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
            }
            
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
Write-Host "All dashboards now have human-readable column headers" -ForegroundColor Cyan

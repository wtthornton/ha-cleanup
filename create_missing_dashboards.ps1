# Create missing dashboard files
$dashboardDir = "grafana/provisioning/dashboards"

# Entity Relationship Dashboard
$entityRelContent = @'
{
  "id": null,
  "title": "Production Entity Relationship Dashboard",
  "tags": ["entity-relationships", "logical-grouping", "home-assistant", "ha-ingestor", "production", "prod"],
  "style": "dark",
  "timezone": "browser",
  "refresh": "60s",
  "time": {"from": "now-6h", "to": "now"},
  "panels": [
    {
      "id": 1,
      "title": "Entity Domain Relationships",
      "type": "heatmap",
      "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0},
      "targets": [
        {
          "query": "from(bucket: \"ha_events\") |> range(start: -6h) |> filter(fn: (r) => r[\"_measurement\"] =~ /ha_/) |> aggregateWindow(every: 1h, fn: count, createEmpty: false) |> group(columns: [\"domain\", \"entity_id\"]) |> yield(name: \"{{domain}}/{{entity_id}}\")",
          "refId": "A"
        }
      ]
    }
  ]
}
'@

# Data Patterns Dashboard
$dataPatternsContent = @'
{
  "id": null,
  "title": "Production Data Patterns Dashboard",
  "tags": ["data-patterns", "anomaly-detection", "home-assistant", "ha-ingestor", "production", "prod"],
  "style": "dark",
  "timezone": "browser",
  "refresh": "60s",
  "time": {"from": "now-24h", "to": "now"},
  "panels": [
    {
      "id": 1,
      "title": "Daily Activity Patterns",
      "type": "timeseries",
      "gridPos": {"h": 8, "w": 24, "x": 0, "y": 0},
      "targets": [
        {
          "query": "from(bucket: \"ha_events\") |> range(start: -24h) |> filter(fn: (r) => r[\"_measurement\"] =~ /ha_/) |> aggregateWindow(every: 1h, fn: count, createEmpty: false) |> yield(name: \"Hourly Activity\")",
          "refId": "A"
        }
      ]
    }
  ]
}
'@

# Device Performance Dashboard
$devicePerfContent = @'
{
  "id": null,
  "title": "Production Device Performance Dashboard",
  "tags": ["device-performance", "operational-metrics", "home-assistant", "ha-ingestor", "production", "prod"],
  "style": "dark",
  "timezone": "browser",
  "refresh": "30s",
  "time": {"from": "now-12h", "to": "now"},
  "panels": [
    {
      "id": 1,
      "title": "Device Response Time Analysis",
      "type": "timeseries",
      "gridPos": {"h": 8, "w": 24, "x": 0, "y": 0},
      "targets": [
        {
          "query": "from(bucket: \"ha_events\") |> range(start: -12h) |> filter(fn: (r) => r[\"_measurement\"] =~ /ha_/) |> aggregateWindow(every: 1h, fn: count, createEmpty: false) |> group(columns: [\"domain\"]) |> yield(name: \"{{domain}}\")",
          "refId": "A"
        }
      ]
    }
  ]
}
'@

# Create the files
Set-Content -Path "$dashboardDir/entity_relationship_dashboard.json" -Value $entityRelContent
Set-Content -Path "$dashboardDir/data_patterns_dashboard.json" -Value $dataPatternsContent
Set-Content -Path "$dashboardDir/device_performance_dashboard.json" -Value $devicePerfContent

Write-Host "Created missing dashboard files:"
Write-Host "- entity_relationship_dashboard.json"
Write-Host "- data_patterns_dashboard.json"
Write-Host "- device_performance_dashboard.json"

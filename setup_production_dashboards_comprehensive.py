#!/usr/bin/env python3
"""
Comprehensive Production Dashboard Setup for HA-Ingestor

This script deploys all production dashboards:
1. Data Quality & Validation Dashboard
2. Entity Performance Dashboard  
3. System Health & Metrics Dashboard
4. Advanced Analytics Dashboard
5. Data Retention & Storage Dashboard
6. Raw Data Explorer Dashboard
7. Entity Relationship Dashboard
8. Data Patterns Dashboard
9. Device Performance Dashboard

Usage:
    python setup_production_dashboards_comprehensive.py
"""

import requests
import json
import time
import os
from pathlib import Path
from typing import Dict, Any, List, Optional

class ComprehensiveProductionDashboardManager:
    """Manage all production Grafana dashboards for HA-Ingestor."""
    
    def __init__(self):
        self.grafana_url = "http://localhost:3000"
        self.admin_credentials = ("admin", "admin")
        self.session = requests.Session()
        self.session.auth = self.admin_credentials
        
        # Production dashboard files
        self.production_dashboards = {
            "data_quality": "grafana/provisioning/dashboards/data_quality_validation_dashboard.json",
            "entity_performance": "grafana/provisioning/dashboards/entity_performance_dashboard.json",
            "system_health": "grafana/provisioning/dashboards/system_health_metrics_dashboard.json",
            "advanced_analytics": "grafana/provisioning/dashboards/advanced_analytics_dashboard.json",
            "data_retention": "grafana/provisioning/dashboards/data_retention_storage_dashboard.json",
            "raw_data_explorer": "grafana/provisioning/dashboards/raw_data_explorer_dashboard.json",
            "entity_relationships": "grafana/provisioning/dashboards/entity_relationship_dashboard.json",
            "data_patterns": "grafana/provisioning/dashboards/data_patterns_dashboard.json",
            "device_performance": "grafana/provisioning/dashboards/device_performance_dashboard.json",
            "home_occupancy": "grafana/provisioning/dashboards/home_occupancy_presence_dashboard.json",
            "energy_management": "grafana/provisioning/dashboards/energy_management_sustainability_dashboard.json",
            "automation_performance": "grafana/provisioning/dashboards/automation_performance_reliability_dashboard.json",
            "device_communication": "grafana/provisioning/dashboards/device_communication_network_health_dashboard.json",
            "predictive_maintenance": "grafana/provisioning/dashboards/predictive_maintenance_anomaly_detection_dashboard.json"
        }
        
        # Production dashboard names
        self.production_names = {
            "data_quality": "Production Data Quality & Validation Dashboard",
            "entity_performance": "Production Entity Performance Dashboard",
            "system_health": "Production System Health & Metrics Dashboard",
            "advanced_analytics": "Production Advanced Analytics Dashboard",
            "data_retention": "Production Data Retention & Storage Dashboard",
            "raw_data_explorer": "Production Raw Data Explorer Dashboard",
            "entity_relationships": "Production Entity Relationship Dashboard",
            "data_patterns": "Production Data Patterns Dashboard",
            "device_performance": "Production Device Performance Dashboard",
            "home_occupancy": "Production Home Occupancy & Presence Analytics Dashboard",
            "energy_management": "Production Energy Management & Sustainability Dashboard",
            "automation_performance": "Production Automation Performance & Reliability Dashboard",
            "device_communication": "Production Device Communication & Network Health Dashboard",
            "predictive_maintenance": "Production Predictive Maintenance & Anomaly Detection Dashboard"
        }
        
    def wait_for_grafana(self, timeout: int = 60) -> bool:
        """Wait for Grafana to be ready."""
        print("⏳ Waiting for Grafana to be ready...")
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                response = self.session.get(f"{self.grafana_url}/api/health", timeout=5)
                if response.status_code == 200:
                    health_data = response.json()
                    if health_data.get("database") == "ok":
                        print("✅ Grafana is ready!")
                        return True
                    else:
                        print(f"⏳ Grafana starting up... Database: {health_data.get('database', 'unknown')}")
                else:
                    print(f"⏳ Grafana starting up... HTTP {response.status_code}")
            except Exception as e:
                print(f"⏳ Waiting for Grafana... {str(e)}")
                
            time.sleep(2)
            
        print("❌ Grafana failed to start within timeout")
        return False
    
    def get_all_dashboards(self) -> List[Dict[str, Any]]:
        """Get all existing dashboards."""
        try:
            response = self.session.get(f"{self.grafana_url}/api/search")
            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ Failed to get dashboards: HTTP {response.status_code}")
                return []
        except Exception as e:
            print(f"❌ Error getting dashboards: {str(e)}")
            return []
    
    def delete_dashboard(self, dashboard_uid: str) -> bool:
        """Delete a specific dashboard by UID."""
        try:
            response = self.session.delete(f"{self.grafana_url}/api/dashboards/uid/{dashboard_uid}")
            if response.status_code == 200:
                print(f"✅ Deleted dashboard: {dashboard_uid}")
                return True
            else:
                print(f"❌ Failed to delete dashboard {dashboard_uid}: HTTP {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error deleting dashboard {dashboard_uid}: {str(e)}")
            return False
    
    def delete_all_dashboards(self) -> bool:
        """Delete all existing dashboards."""
        print("🗑️  Deleting all existing dashboards...")
        
        dashboards = self.get_all_dashboards()
        if not dashboards:
            print("ℹ️  No dashboards to delete")
            return True
        
        success_count = 0
        for dashboard in dashboards:
            if self.delete_dashboard(dashboard["uid"]):
                success_count += 1
        
        print(f"✅ Deleted {success_count}/{len(dashboards)} dashboards")
        return success_count == len(dashboards)
    
    def load_dashboard_json(self, file_path: str) -> Optional[Dict[str, Any]]:
        """Load dashboard JSON from file."""
        try:
            if not os.path.exists(file_path):
                print(f"❌ Dashboard file not found: {file_path}")
                return None
                
            with open(file_path, 'r', encoding='utf-8') as f:
                dashboard_data = json.load(f)
            
            # Ensure production naming
            if "title" in dashboard_data:
                dashboard_data["title"] = f"PROD: {dashboard_data['title']}"
            
            return dashboard_data
        except Exception as e:
            print(f"❌ Error loading dashboard {file_path}: {str(e)}")
            return None
    
    def create_dashboard(self, dashboard_data: Dict[str, Any]) -> bool:
        """Create a new dashboard."""
        try:
            # Prepare dashboard payload
            payload = {
                "dashboard": dashboard_data,
                "overwrite": True,
                "folderId": 0  # Root folder
            }
            
            response = self.session.post(
                f"{self.grafana_url}/api/dashboards/db",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Created dashboard: {dashboard_data.get('title', 'Unknown')}")
                return True
            else:
                print(f"❌ Failed to create dashboard: HTTP {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error creating dashboard: {str(e)}")
            return False
    
    def deploy_production_dashboards(self) -> bool:
        """Deploy all production dashboards."""
        print("🚀 Deploying production dashboards...")
        
        success_count = 0
        total_count = len(self.production_dashboards)
        
        for dashboard_key, file_path in self.production_dashboards.items():
            print(f"\n📊 Deploying {dashboard_key} dashboard...")
            
            # Load dashboard data
            dashboard_data = self.load_dashboard_json(file_path)
            if not dashboard_data:
                continue
            
            # Create dashboard
            if self.create_dashboard(dashboard_data):
                success_count += 1
                print(f"✅ Successfully deployed {dashboard_key} dashboard")
            else:
                print(f"❌ Failed to deploy {dashboard_key} dashboard")
        
        print(f"\n🎯 Dashboard deployment summary:")
        print(f"   Successfully deployed: {success_count}/{total_count}")
        print(f"   Failed: {total_count - success_count}")
        
        return success_count == total_count
    
    def verify_dashboards(self) -> bool:
        """Verify that all production dashboards are accessible."""
        print("🔍 Verifying production dashboards...")
        
        dashboards = self.get_all_dashboards()
        if not dashboards:
            print("❌ No dashboards found")
            return False
        
        # Check for production dashboards
        prod_dashboards = [d for d in dashboards if "PROD:" in d.get("title", "")]
        
        print(f"📊 Found {len(prod_dashboards)} production dashboards:")
        for dashboard in prod_dashboards:
            print(f"   - {dashboard['title']}")
        
        return len(prod_dashboards) >= len(self.production_dashboards)
    
    def run(self) -> bool:
        """Run the comprehensive dashboard setup."""
        print("🚀 HA-Ingestor Comprehensive Production Dashboard Setup")
        print("=" * 60)
        
        # Wait for Grafana
        if not self.wait_for_grafana():
            return False
        
        # Check if there are existing dashboards to delete
        existing_dashboards = self.get_all_dashboards()
        if existing_dashboards:
            print(f"🗑️  Found {len(existing_dashboards)} existing dashboards, attempting to delete...")
            if not self.delete_all_dashboards():
                print("⚠️  Warning: Some dashboards may not have been deleted")
        else:
            print("ℹ️  No existing dashboards found, proceeding with fresh deployment")
        
        # Wait a moment for cleanup
        time.sleep(2)
        
        # Deploy production dashboards
        if not self.deploy_production_dashboards():
            print("❌ Failed to deploy all production dashboards")
            return False
        
        # Verify deployment
        if not self.verify_dashboards():
            print("❌ Dashboard verification failed")
            return False
        
        print("\n🎉 Production dashboard setup completed successfully!")
        print("\n📊 Available Production Dashboards:")
        print("   1. Data Quality & Validation")
        print("   2. Entity Performance")
        print("   3. System Health & Metrics")
        print("   4. Advanced Analytics")
        print("   5. Data Retention & Storage")
        print("   6. Raw Data Explorer")
        print("   7. Entity Relationships")
        print("   8. Data Patterns")
        print("   9. Device Performance")
        print("   10. Home Occupancy & Presence Analytics")
        print("   11. Energy Management & Sustainability")
        print("   12. Automation Performance & Reliability")
        print("   13. Device Communication & Network Health")
        print("   14. Predictive Maintenance & Anomaly Detection")
        
        return True

def main():
    """Main function."""
    manager = ComprehensiveProductionDashboardManager()

    try:
        success = manager.run()
        if success:
            print("\n✅ All production dashboards are now available in Grafana!")
            print("   Access them at: http://localhost:3000")
        else:
            print("\n❌ Production dashboard setup failed!")
            return 1
    except KeyboardInterrupt:
        print("\n⚠️  Setup interrupted by user")
        return 1
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        return 1

    return 0

if __name__ == "__main__":
    exit(main())

#!/usr/bin/env python3
"""
10 Consolidated Production Dashboard Setup for HA-Ingestor

This script deploys 10 focused, high-quality production dashboards:
1. Data Ingestion & Collection Dashboard
2. System Health & Performance Dashboard
3. Raw Data Explorer Dashboard
4. Entity Performance & Analytics Dashboard
5. Home Occupancy & Security Dashboard
6. Energy Management & Sustainability Dashboard
7. Automation & Service Performance Dashboard
8. Device Communication & Network Health Dashboard
9. Predictive Maintenance & Anomaly Detection Dashboard
10. Data Quality & Validation Dashboard

Usage:
    python setup_10_consolidated_dashboards.py
"""

import requests
import json
import time
import os
from pathlib import Path
from typing import Dict, Any, List, Optional

class ConsolidatedDashboardManager:
    """Manage 10 consolidated production Grafana dashboards for HA-Ingestor."""
    
    def __init__(self):
        self.grafana_url = "http://localhost:3000"
        self.admin_credentials = ("admin", "admin")
        self.session = requests.Session()
        self.session.auth = self.admin_credentials
        
        # Get current working directory
        self.base_dir = os.getcwd()
        print(f"Base directory: {self.base_dir}")
        
        # Consolidated dashboard files with absolute paths
        self.dashboards = {
            "data_ingestion": os.path.join(self.base_dir, "grafana", "provisioning", "dashboards", "01_data_ingestion_collection_dashboard.json"),
            "system_health": os.path.join(self.base_dir, "grafana", "provisioning", "dashboards", "02_system_health_performance_dashboard.json"),
            "raw_data": os.path.join(self.base_dir, "grafana", "provisioning", "dashboards", "03_raw_data_explorer_dashboard.json"),
            "entity_performance": os.path.join(self.base_dir, "grafana", "provisioning", "dashboards", "04_entity_performance_analytics_dashboard.json"),
            "home_occupancy": os.path.join(self.base_dir, "grafana", "provisioning", "dashboards", "05_home_occupancy_security_dashboard.json"),
            "energy_management": os.path.join(self.base_dir, "grafana", "provisioning", "dashboards", "06_energy_management_sustainability_dashboard.json"),
            "automation": os.path.join(self.base_dir, "grafana", "provisioning", "dashboards", "07_automation_service_performance_dashboard.json"),
            "device_communication": os.path.join(self.base_dir, "grafana", "provisioning", "dashboards", "08_device_communication_network_health_dashboard.json"),
            "predictive_maintenance": os.path.join(self.base_dir, "grafana", "provisioning", "dashboards", "09_predictive_maintenance_anomaly_detection_dashboard.json"),
            "data_quality": os.path.join(self.base_dir, "grafana", "provisioning", "dashboards", "10_data_quality_validation_dashboard.json")
        }
        
        # Dashboard names
        self.dashboard_names = {
            "data_ingestion": "Production Data Ingestion & Collection Dashboard",
            "system_health": "Production System Health & Performance Dashboard",
            "raw_data": "Production Raw Data Explorer Dashboard",
            "entity_performance": "Production Entity Performance & Analytics Dashboard",
            "home_occupancy": "Production Home Occupancy & Security Dashboard",
            "energy_management": "Production Energy Management & Sustainability Dashboard",
            "automation": "Production Automation & Service Performance Dashboard",
            "device_communication": "Production Device Communication & Network Health Dashboard",
            "predictive_maintenance": "Production Predictive Maintenance & Anomaly Detection Dashboard",
            "data_quality": "Production Data Quality & Validation Dashboard"
        }
        
        # Debug: Print all file paths
        print("Dashboard file paths:")
        for key, path in self.dashboards.items():
            exists = os.path.exists(path)
            print(f"  {key}: {path} (exists: {exists})")
        
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
    
    def deploy_dashboards(self) -> bool:
        """Deploy all 10 consolidated dashboards."""
        print("🚀 Deploying 10 consolidated production dashboards...")
        
        success_count = 0
        total_count = len(self.dashboards)
        
        for dashboard_key, file_path in self.dashboards.items():
            print(f"\n📊 Deploying {dashboard_key} dashboard...")
            print(f"   File path: {file_path}")
            
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
        
        return len(prod_dashboards) >= len(self.dashboards)
    
    def run(self) -> bool:
        """Run the consolidated dashboard setup."""
        print("🚀 HA-Ingestor 10 Consolidated Production Dashboard Setup")
        print("=" * 65)
        
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
        
        # Deploy dashboards
        if not self.deploy_dashboards():
            print("❌ Failed to deploy all dashboards")
            return False
        
        # Verify deployment
        if not self.verify_dashboards():
            print("❌ Dashboard verification failed")
            return False
        
        print("\n🎉 Consolidated dashboard setup completed successfully!")
        print("\n📊 Available Production Dashboards:")
        print("   1. Data Ingestion & Collection Dashboard")
        print("   2. System Health & Performance Dashboard")
        print("   3. Raw Data Explorer Dashboard")
        print("   4. Entity Performance & Analytics Dashboard")
        print("   5. Home Occupancy & Security Dashboard")
        print("   6. Energy Management & Sustainability Dashboard")
        print("   7. Automation & Service Performance Dashboard")
        print("   8. Device Communication & Network Health Dashboard")
        print("   9. Predictive Maintenance & Anomaly Detection Dashboard")
        print("   10. Data Quality & Validation Dashboard")
        
        return True

def main():
    """Main function."""
    manager = ConsolidatedDashboardManager()

    try:
        success = manager.run()
        if success:
            print("\n✅ All 10 consolidated production dashboards are now available in Grafana!")
            print("   Access them at: http://localhost:3000")
        else:
            print("\n❌ Dashboard setup failed!")
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

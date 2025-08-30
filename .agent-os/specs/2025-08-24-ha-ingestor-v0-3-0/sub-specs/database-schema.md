# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-24-ha-ingestor-v0-3-0/spec.md

## Changes

### New Tables
- **device_metadata** - Store device capabilities, limitations, and configuration
- **integration_info** - Track integration versions, health status, and configuration
- **network_topology** - Map device relationships and communication patterns
- **event_context** - Store temporal and spatial context for events
- **relationship_mapping** - Track device and automation dependencies
- **data_quality_metrics** - Monitor validation success rates and error patterns

### New Columns
- **events table**: Add context_id, enrichment_status, validation_score
- **devices table**: Add metadata_id, topology_id, relationship_group

### Modifications
- **existing events table**: Extend with context and enrichment fields
- **existing devices table**: Add relationship and metadata references

## Specifications

### Device Metadata Table
```sql
CREATE TABLE device_metadata (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) NOT NULL,
    capabilities JSONB,
    limitations JSONB,
    integration_version VARCHAR(50),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(device_id)
);

CREATE INDEX idx_device_metadata_device_id ON device_metadata(device_id);
CREATE INDEX idx_device_metadata_capabilities ON device_metadata USING GIN(capabilities);
```

### Integration Info Table
```sql
CREATE TABLE integration_info (
    id SERIAL PRIMARY KEY,
    integration_name VARCHAR(255) NOT NULL,
    version VARCHAR(50),
    health_status VARCHAR(50),
    configuration JSONB,
    last_health_check TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(integration_name)
);

CREATE INDEX idx_integration_info_name ON integration_info(integration_name);
CREATE INDEX idx_integration_info_health ON integration_info(health_status);
```

### Network Topology Table
```sql
CREATE TABLE network_topology (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) NOT NULL,
    parent_device_id VARCHAR(255),
    room_location VARCHAR(255),
    zone_mapping VARCHAR(255),
    proximity_relationships JSONB,
    communication_patterns JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id),
    FOREIGN KEY (parent_device_id) REFERENCES devices(id)
);

CREATE INDEX idx_network_topology_device_id ON network_topology(device_id);
CREATE INDEX idx_network_topology_parent_id ON network_topology(parent_device_id);
CREATE INDEX idx_network_topology_room ON network_topology(room_location);
```

### Event Context Table
```sql
CREATE TABLE event_context (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL,
    temporal_context JSONB,
    spatial_context JSONB,
    environmental_context JSONB,
    user_context JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_context_event_id ON event_context(event_id);
CREATE INDEX idx_event_context_temporal ON event_context USING GIN(temporal_context);
CREATE INDEX idx_event_context_spatial ON event_context USING GIN(spatial_context);
```

### Relationship Mapping Table
```sql
CREATE TABLE relationship_mapping (
    id SERIAL PRIMARY KEY,
    source_entity_id VARCHAR(255) NOT NULL,
    target_entity_id VARCHAR(255) NOT NULL,
    relationship_type VARCHAR(100) NOT NULL,
    dependency_level INTEGER,
    circular_dependency BOOLEAN DEFAULT FALSE,
    resource_sharing JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_relationship_mapping_source ON relationship_mapping(source_entity_id);
CREATE INDEX idx_relationship_mapping_target ON relationship_mapping(target_entity_id);
CREATE INDEX idx_relationship_mapping_type ON relationship_mapping(relationship_type);
```

### Data Quality Metrics Table
```sql
CREATE TABLE data_quality_metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(255) NOT NULL,
    metric_value DECIMAL(10,4),
    validation_success_rate DECIMAL(5,2),
    error_count INTEGER DEFAULT 0,
    error_types JSONB,
    measurement_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_data_quality_metrics_name ON data_quality_metrics(metric_name);
CREATE INDEX idx_data_quality_metrics_timestamp ON data_quality_metrics(measurement_timestamp);
```

## Rationale

### Performance Considerations
- **JSONB indexes**: Enable efficient querying of complex metadata structures
- **Composite indexes**: Optimize common query patterns for relationships and context
- **Partitioning**: Consider partitioning large tables by date for better performance

### Data Integrity Rules
- **Foreign key constraints**: Ensure referential integrity between related entities
- **Unique constraints**: Prevent duplicate metadata and relationship entries
- **Check constraints**: Validate data quality metrics within acceptable ranges

### Scalability
- **Indexed fields**: Support high-volume queries on frequently accessed data
- **JSONB storage**: Efficient storage and querying of flexible metadata structures
- **Timestamp indexing**: Enable time-based queries and data retention policies

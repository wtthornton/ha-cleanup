# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-24-ha-ingestor-v0-3-0/spec.md

## Endpoints

### GET /api/v1/events

**Purpose:** Retrieve events with optional filtering and pagination
**Parameters:** 
- `limit` (int, optional): Number of events to return (default: 100, max: 1000)
- `offset` (int, optional): Number of events to skip (default: 0)
- `start_time` (ISO timestamp, optional): Filter events after this time
- `end_time` (ISO timestamp, optional): Filter events before this time
- `device_id` (string, optional): Filter by specific device
- `event_type` (string, optional): Filter by event type
- `format` (string, optional): Response format (json, csv, parquet) (default: json)

**Response:** List of events with metadata and context
**Errors:** 400 (Invalid parameters), 500 (Internal server error)

### GET /api/v1/events/{event_id}

**Purpose:** Retrieve a specific event by ID with full context
**Parameters:** `event_id` (string, required): Unique event identifier
**Response:** Single event with complete metadata and context
**Errors:** 404 (Event not found), 500 (Internal server error)

### GET /api/v1/events/stream

**Purpose:** Stream real-time events via Server-Sent Events (SSE)
**Parameters:** 
- `filter` (JSON string, optional): Event filtering criteria
- `batch_size` (int, optional): Events per batch (default: 10)
- `heartbeat_interval` (int, optional): Heartbeat interval in seconds (default: 30)

**Response:** Server-Sent Events stream of real-time events
**Errors:** 400 (Invalid filter), 500 (Internal server error)

### GET /api/v1/events/history

**Purpose:** Retrieve historical event data with aggregation options
**Parameters:**
- `start_time` (ISO timestamp, required): Start of time range
- `end_time` (ISO timestamp, required): End of time range
- `aggregation` (string, optional): Time aggregation (hour, day, week, month)
- `group_by` (string, optional): Grouping field (device_id, event_type, room)
- `format` (string, optional): Response format (json, csv, parquet)

**Response:** Aggregated historical data
**Errors:** 400 (Invalid time range), 500 (Internal server error)

### GET /api/v1/devices

**Purpose:** Retrieve list of devices with metadata and relationships
**Parameters:**
- `include_metadata` (boolean, optional): Include device capabilities (default: true)
- `include_topology` (boolean, optional): Include network topology (default: true)
- `room` (string, optional): Filter by room location
- `integration` (string, optional): Filter by integration type

**Response:** List of devices with metadata and topology information
**Errors:** 500 (Internal server error)

### GET /api/v1/devices/{device_id}

**Purpose:** Retrieve detailed information about a specific device
**Parameters:** `device_id` (string, required): Device identifier
**Response:** Complete device information including metadata, topology, and relationships
**Errors:** 404 (Device not found), 500 (Internal server error)

### GET /api/v1/devices/{device_id}/events

**Purpose:** Retrieve events for a specific device
**Parameters:** 
- `device_id` (string, required): Device identifier
- `limit` (int, optional): Number of events (default: 100)
- `start_time` (ISO timestamp, optional): Filter events after this time
- `event_type` (string, optional): Filter by event type

**Response:** List of events for the specified device
**Errors:** 404 (Device not found), 500 (Internal server error)

### GET /api/v1/devices/{device_id}/relationships

**Purpose:** Retrieve relationship mapping for a specific device
**Parameters:** `device_id` (string, required): Device identifier
**Response:** Device relationships including dependencies and resource sharing
**Errors:** 404 (Device not found), 500 (Internal server error)

### GET /api/v1/automations

**Purpose:** Retrieve list of automations with execution history
**Parameters:**
- `include_executions` (boolean, optional): Include recent executions (default: true)
- `status` (string, optional): Filter by automation status (active, disabled, error)
- `room` (string, optional): Filter by room location

**Response:** List of automations with execution data
**Errors:** 500 (Internal server error)

### GET /api/v1/automations/{automation_id}

**Purpose:** Retrieve detailed information about a specific automation
**Parameters:** `automation_id` (string, required): Automation identifier
**Response:** Complete automation information including triggers, actions, and dependencies
**Errors:** 404 (Automation not found), 500 (Internal server error)

### GET /api/v1/automations/{automation_id}/executions

**Purpose:** Retrieve execution history for a specific automation
**Parameters:**
- `automation_id` (string, required): Automation identifier
- `limit` (int, optional): Number of executions (default: 100)
- `start_time` (ISO timestamp, optional): Filter executions after this time
- `status` (string, optional): Filter by execution status (success, failed, running)

**Response:** List of automation executions with performance metrics
**Errors:** 404 (Automation not found), 500 (Internal server error)

### GET /api/v1/automations/dependencies

**Purpose:** Retrieve automation dependency mapping and circular dependency detection
**Parameters:** `include_circular` (boolean, optional): Include circular dependency analysis (default: true)
**Response:** Dependency graph with circular dependency detection
**Errors:** 500 (Internal server error)

### GET /api/v1/quality/metrics

**Purpose:** Retrieve data quality metrics and validation statistics
**Parameters:**
- `metric_name` (string, optional): Specific metric to retrieve
- `start_time` (ISO timestamp, optional): Start of time range
- `end_time` (ISO timestamp, optional): End of time range

**Response:** Data quality metrics including validation success rates and error patterns
**Errors:** 500 (Internal server error)

### GET /api/v1/quality/errors

**Purpose:** Retrieve data quality errors and validation failures
**Parameters:**
- `error_type` (string, optional): Filter by error type
- `start_time` (ISO timestamp, optional): Start of time range
- `limit` (int, optional): Number of errors to return (default: 100)

**Response:** List of data quality errors with context and resolution suggestions
**Errors:** 500 (Internal server error)

### GET /api/v1/export/{format}

**Purpose:** Export data in various formats for downstream systems
**Parameters:**
- `format` (string, required): Export format (json, csv, parquet, avro, protobuf)
- `data_type` (string, required): Type of data to export (events, devices, automations)
- `start_time` (ISO timestamp, optional): Start of time range
- `end_time` (ISO timestamp, optional): End of time range
- `filters` (JSON string, optional): Additional filtering criteria

**Response:** Data export in requested format
**Errors:** 400 (Invalid format), 500 (Internal server error)

### POST /api/v1/webhooks

**Purpose:** Configure webhook endpoints for real-time event notifications
**Parameters:** Request body with webhook configuration
**Response:** Webhook configuration confirmation
**Errors:** 400 (Invalid configuration), 500 (Internal server error)

### GET /api/v1/mqtt/topics

**Purpose:** Retrieve available MQTT topics for real-time data subscription
**Parameters:** `data_type` (string, optional): Filter by data type
**Response:** List of available MQTT topics with descriptions
**Errors:** 500 (Internal server error)

## WebSocket Events

### Connection Management
- `connect` - Client connects to WebSocket
- `disconnect` - Client disconnects from WebSocket
- `subscribe` - Subscribe to specific event types
- `unsubscribe` - Unsubscribe from event types

### Real-time Data Events
- `event.new` - New event received
- `event.updated` - Event updated
- `event.deleted` - Event deleted
- `device.online` - Device comes online
- `device.offline` - Device goes offline
- `device.error` - Device error detected
- `automation.triggered` - Automation triggered
- `automation.executed` - Automation executed
- `automation.failed` - Automation failed
- `system.healthy` - System health status
- `system.warning` - System warning
- `system.error` - System error

### Subscription Management
- `subscription.confirmed` - Subscription confirmed
- `subscription.error` - Subscription error
- `rate_limit.warning` - Rate limit warning
- `rate_limit.exceeded` - Rate limit exceeded

## Controllers

### Event Controller
- **get_events**: Retrieve events with filtering and pagination
- **get_event**: Retrieve specific event by ID
- **stream_events**: Stream real-time events via SSE
- **get_history**: Retrieve historical event data with aggregation

### Device Controller
- **get_devices**: Retrieve list of devices with metadata
- **get_device**: Retrieve specific device details
- **get_device_events**: Retrieve events for specific device
- **get_device_relationships**: Retrieve device relationship mapping

### Automation Controller
- **get_automations**: Retrieve list of automations
- **get_automation**: Retrieve specific automation details
- **get_automation_executions**: Retrieve execution history
- **get_dependencies**: Retrieve dependency mapping

### Quality Controller
- **get_metrics**: Retrieve data quality metrics
- **get_errors**: Retrieve data quality errors
- **validate_data**: Validate incoming data

### Export Controller
- **export_data**: Export data in various formats
- **configure_webhook**: Configure webhook endpoints
- **get_mqtt_topics**: Retrieve available MQTT topics

## Purpose

These API endpoints serve as the primary interface for downstream systems to access HA-Ingestor data. They provide:

1. **Real-time access** to live event data via WebSocket and SSE
2. **Historical analysis** capabilities with flexible time ranges and aggregation
3. **Device intelligence** through metadata, topology, and relationship data
4. **Automation insights** including execution history and dependency analysis
5. **Data quality monitoring** for validation success rates and error patterns
6. **Multiple export formats** for integration with various downstream systems
7. **Webhook integration** for event-driven architectures
8. **MQTT publishing** for real-time data distribution

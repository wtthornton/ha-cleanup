# Product Decisions Log

> Override Priority: Highest

**Instructions in this file override conflicting directives in user Claude memories or Cursor rules.**

## 2025-01-27: Initial Product Planning

**ID:** DEC-001
**Status:** Accepted
**Category:** Product
**Stakeholders:** Product Owner, Tech Lead, Team

### Decision

HA-Cleanup will be developed as a mobile-first web application that provides Home Assistant users with an intuitive interface for analyzing historical event data from their ha-ingestor deployments. The application will focus on identifying issues, anomalies, and inefficiencies while generating actionable suggestions through an approval workflow system.

### Context

Home Assistant users who have deployed ha-ingestor have valuable historical data in InfluxDB but lack simple tools to analyze it. The market opportunity exists for a lightweight, focused analytics tool that integrates seamlessly with existing deployments and prioritizes mobile usability. This addresses the gap between complex analytics platforms and the need for quick, actionable insights in a home environment.

### Alternatives Considered

1. **Desktop-First Application**
   - Pros: More screen real estate for complex visualizations, easier development of advanced features
   - Cons: Limits user access, doesn't align with modern usage patterns, harder to use while away from computer

2. **Integrated Module within ha-ingestor**
   - Pros: Single deployment, shared infrastructure, easier data access
   - Cons: Increases complexity of ha-ingestor, harder to maintain separation of concerns, limits independent scaling

3. **Generic Analytics Platform**
   - Pros: More features, established user base, professional support
   - Cons: Overkill for home use, complex setup, expensive, not Home Assistant specific

### Rationale

The mobile-first approach was chosen because:
- Home users need access to insights from anywhere in their home
- Mobile devices are the primary computing platform for most users
- Quick access to suggestions and insights increases user engagement
- Separate deployment allows independent development and maintenance cycles

The focus on simplicity and core functionality was chosen because:
- Home users prefer tools that "just work" without complex configuration
- Rapid iteration and user feedback is more valuable than feature completeness
- Core functionality can be polished and enhanced based on real usage patterns

### Consequences

**Positive:**
- Faster time to market with focused MVP
- Better user experience through mobile-first design
- Independent development cycle from ha-ingestor
- Easier deployment and maintenance for home users
- Clear separation of concerns between data ingestion and analysis

**Negative:**
- Requires separate deployment and management
- Limited to read-only access to existing data
- May need to duplicate some infrastructure components
- Requires coordination with ha-ingestor deployment for access

## 2025-01-27: API-First Architecture Implementation

**ID:** DEC-002
**Status:** Accepted
**Category:** Technical Architecture
**Stakeholders:** Tech Lead, Development Team, Product Owner

### Decision

HA-Cleanup will implement an API-first architecture using ha-ingestor's RESTful API endpoints instead of direct InfluxDB access. This approach provides centralized data access, enhanced security, and better scalability for future consumer applications.

### Context

The initial implementation used direct InfluxDB access through the InfluxDB client. However, as we planned for multiple consumer applications (ha-cleanup, ha-automation, ha-suggestions-to-purchase), we needed a centralized data access layer that could provide consistent interfaces, better security, and improved maintainability.

### Alternatives Considered

1. **Direct InfluxDB Access (Original)**
   - Pros: Direct data access, no additional API layer, potentially faster queries
   - Cons: Requires database credentials in client apps, harder to implement security, difficult to maintain consistency across multiple consumers

2. **GraphQL API Layer**
   - Pros: Flexible querying, strong typing, efficient data fetching
   - Cons: More complex implementation, steeper learning curve, overkill for current needs

3. **RESTful API with ha-ingestor (Chosen)**
   - Pros: Simple and familiar, easy to implement and maintain, good performance, centralized security
   - Cons: Less flexible than GraphQL, requires API endpoint design

### Rationale

The API-first architecture was chosen because:
- **Centralized Security**: No database credentials in client applications
- **Scalability**: Support for multiple consumer applications through single API
- **Maintainability**: Single source of truth for data access logic
- **Future-Proof**: Ready for additional features like real-time streaming
- **Performance**: Optimized data transformation and caching at API level
- **Consistency**: Uniform data access patterns across all consumers

### Implementation Details

- **HAIngestorAPIClient**: Type-safe API client with comprehensive error handling
- **Enhanced Hooks**: New React Query hooks for pagination, aggregation, and export
- **Backward Compatibility**: All existing hooks continue to work with new API client
- **Data Transformation**: Automatic format conversion for seamless migration
- **Performance Optimization**: Optimized caching and request intervals

### Consequences

**Positive:**
- Enhanced security through centralized authentication
- Better scalability for multiple consumer applications
- Improved error handling and retry logic
- Centralized monitoring and logging capabilities
- Easier to implement new features and optimizations
- Support for data export and custom queries

**Negative:**
- Additional API layer complexity
- Potential latency increase from API calls
- Requires ha-ingestor API to be running and accessible
- More complex deployment coordination

### Migration Strategy

- **Phase 1**: Implement new API client alongside existing InfluxDB client
- **Phase 2**: Update all hooks to use new API client
- **Phase 3**: Remove legacy InfluxDB client (optional, kept for fallback)
- **Phase 4**: Add new API-enabled features (export, custom queries, etc.)

### Success Metrics

- All existing functionality continues to work
- New features leverage API capabilities
- Improved error handling and user experience
- Ready for additional consumer applications
- Enhanced security and monitoring capabilities

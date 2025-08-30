# Product Roadmap

## Effort Scale
- **XS:** 1 day
- **S:** 2-3 days  
- **M:** 1 week
- **L:** 2 weeks
- **XL:** 3+ weeks

## Phase 1: Core MVP (Weeks 1-4) ✅ **COMPLETED**

**Goal:** Deliver a functional mobile-first interface for viewing historical Home Assistant data
**Success Criteria:** Users can browse events, view basic charts, and access the application from mobile devices

### Features

- [x] **Project Setup** - Initialize React + TypeScript project with Vite and Tailwind CSS `XS`
- [x] **Basic UI Framework** - Create responsive layout with mobile-first design `S`
- [x] **Data Connection** - Connect to ha-ingestor API instead of direct InfluxDB access `M`
- [x] **Event Browser** - Display Home Assistant events with basic filtering `M`
- [x] **Simple Charts** - Basic line charts for sensor data visualization `M`
- [x] **Mobile Navigation** - Touch-friendly navigation and responsive design `S`
- [x] **Mock Data Mode** - Enable development with sample data for rapid iteration `XS`

### Dependencies

- ✅ ha-ingestor must be deployed and running with API endpoints
- ✅ ha-ingestor API must be accessible from ha-cleanup container

### **API-First Architecture Implementation** ✅
- **HAIngestorAPIClient** - RESTful API client replacing direct InfluxDB access
- **Enhanced Data Hooks** - New hooks for pagination, aggregation, and export
- **Backward Compatibility** - All existing hooks continue to work
- **Error Handling** - Enhanced retry logic and connection management
- **Performance Optimization** - Optimized caching and request intervals

## Phase 2: Analysis & Insights (Weeks 5-8) 🚀 **IN PROGRESS**

**Goal:** Add analytical capabilities and suggestion generation
**Success Criteria:** Users can identify patterns, view performance metrics, and receive actionable suggestions

### Features

- [x] **API Integration** - Complete ha-ingestor API integration with enhanced features `M`
- [x] **Enhanced Data Access** - Pagination, aggregation, and export capabilities `M`
- [ ] **Pattern Recognition** - Identify recurring events and automation behaviors `L`
- [ ] **Performance Metrics** - Calculate and display system efficiency indicators `M`
- [ ] **Anomaly Detection** - Highlight unusual patterns and potential issues `L`
- [ ] **Suggestion Engine** - Generate actionable recommendations based on data analysis `XL`
- [ ] **Approval Workflow** - Allow users to approve, reject, or modify suggestions `M`
- [x] **Enhanced Charts** - Interactive visualizations with zoom and filtering `M`
- [x] **Export Functionality** - Download reports and data in JSON, CSV, XML formats `S`

### Dependencies

- ✅ Phase 1 features must be complete
- ✅ ha-ingestor API integration complete
- [ ] Suggestion logic requires sufficient historical data for analysis

### **New API-Enabled Features** ✅
- **Data Export** - Support for JSON, CSV, and XML formats
- **Custom Queries** - Execute sanitized Flux queries through API
- **Metrics Aggregation** - Hourly, daily, weekly, and monthly aggregation
- **Advanced Filtering** - Domain, entity, and time-based filtering
- **API Health Monitoring** - Connection status and latency tracking

## Phase 3: Polish & Optimization (Weeks 9-12)

**Goal:** Enhance user experience and add advanced features
**Success Criteria:** Professional-grade application with smooth performance and advanced analytics

### Features

- [ ] **Advanced Analytics** - Trend analysis and predictive insights `L`
- [ ] **Custom Dashboards** - User-configurable dashboard layouts `M`
- [ ] **Notification System** - Alert users to new suggestions and important findings `S`
- [x] **Performance Optimization** - Optimize data loading and chart rendering `M`
- [ ] **PWA Features** - Offline capabilities and app-like experience `M`
- [ ] **User Preferences** - Save user settings and preferences `S`
- [x] **Advanced Filtering** - Complex query building and saved filters `M`
- [ ] **Data Validation** - Ensure data quality and handle edge cases `S`

### Dependencies

- ✅ Phase 2 API features must be complete
- [ ] User feedback from initial deployment should inform final features

### **API-Enabled Optimizations** ✅
- **Request Deduplication** - React Query automatic deduplication
- **Smart Caching** - Optimized stale times and refetch intervals
- **Connection Pooling** - Efficient API connection management
- **Error Recovery** - Automatic retry with exponential backoff

## Future Considerations

### Phase 4: Advanced Features
- **Real-time Integration** - WebSocket support for live data updates
- **Machine Learning** - ML-powered suggestion accuracy improvements
- **Multi-user Support** - Role-based access control
- **Third-party API** - External integrations and webhooks

### Phase 5: Enterprise Features
- **User Authentication** - Secure user management system
- **Advanced Security** - API key management and rate limiting
- **Multi-tenant Architecture** - Support for multiple deployments
- **Professional Support** - Documentation and support systems

## **API-First Architecture Benefits** ✅

### **Centralized Data Access**
- Single API layer for all consumers (ha-cleanup, future ha-automation, ha-suggestions-to-purchase)
- Enhanced security through centralized authentication and authorization
- Better monitoring and logging capabilities

### **Scalability & Performance**
- Support for multiple consumer applications
- Optimized data transformation and caching
- Reduced database connection overhead

### **Maintainability**
- Single source of truth for data access logic
- Easier to implement new features and optimizations
- Consistent error handling and retry logic

### **Future-Proof Design**
- Ready for additional ha-ingestor features
- Support for real-time data streaming
- Extensible API with versioning support

## Phase Guidelines
- **Phase 1:** ✅ Core MVP functionality (mobile-first interface, basic data viewing via API)
- **Phase 2:** 🚀 Key differentiators (suggestion engine, approval workflow, enhanced analytics via API)
- **Phase 3:** Scale and polish (advanced features, performance optimization, PWA)
- **Phase 4:** Advanced features (real-time integration, ML capabilities)
- **Phase 5:** Enterprise features (authentication, multi-tenancy, support)

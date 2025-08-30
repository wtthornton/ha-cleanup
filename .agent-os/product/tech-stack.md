# Technical Stack

## Application Framework
- **Node.js 20+** with Express.js for backend API
- **React 18+** with TypeScript for frontend

## **Data Access Architecture** ✅ **UPDATED**
- **ha-ingestor API** - RESTful API endpoints for centralized data access
- **HAIngestorAPIClient** - Type-safe API client with error handling and retry logic
- **React Query Integration** - Optimized data fetching with caching and deduplication
- **Backward Compatibility** - Legacy InfluxDB client maintained for fallback scenarios

## Database System
- **ha-ingestor InfluxDB** - Centralized data storage with API access layer
- **SQLite** - Local suggestion tracking and user preferences

## JavaScript Framework
- **React 18+** with TypeScript for component-based UI development

## Import Strategy
- **Node** with npm/yarn for package management

## CSS Framework
- **Tailwind CSS 3.4+** for utility-first styling

## UI Component Library
- **Headless UI** for accessible, unstyled components
- **Radix UI** for advanced component primitives

## Fonts Provider
- **Google Fonts** for web-safe typography

## Icon Library
- **Heroicons** for consistent iconography
- **Lucide React** for additional icon options

## Application Hosting
- **Docker** for containerized deployment alongside ha-ingestor
- **Local network** deployment for home use

## Database Hosting
- **ha-ingestor API** - Centralized data access through RESTful endpoints
- **Local SQLite** file for application data

## Asset Hosting
- **Local static files** served by the application
- **CDN** for external dependencies (fonts, icons)

## Deployment Solution
- **Docker Compose** for local deployment
- **GitHub Actions** for CI/CD pipelines
- **Manual deployment** scripts for home environment

## Code Repository URL
- **GitHub** repository for source code and collaboration

## Additional Technical Components

### Frontend Dependencies
- **React Router** for client-side routing
- **React Query** for data fetching and caching
- **Recharts** for data visualization and charts
- **Date-fns** for date manipulation
- **Zod** for runtime type validation

### **API Integration Dependencies** ✅ **NEW**
- **HAIngestorAPIClient** - Custom API client for ha-ingestor integration
- **Enhanced Error Handling** - RetryHandler with exponential backoff
- **Request Management** - AbortController for timeout handling
- **Data Transformation** - Automatic format conversion for backward compatibility

### Backend Dependencies
- **Express.js** for REST API endpoints
- **CORS** for cross-origin resource sharing
- **Helmet** for security headers
- **Morgan** for HTTP request logging
- **ha-ingestor API** - Primary data source through REST endpoints

### Development Tools
- **Vite** for fast development and building
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Jest** for testing framework

### Data Visualization
- **Recharts** for interactive charts and graphs
- **D3.js** for advanced custom visualizations
- **Chart.js** for additional chart types

### Mobile Optimization
- **PWA capabilities** for mobile app-like experience
- **Responsive design** with mobile-first approach
- **Touch-friendly interactions** for mobile devices

## **API-First Architecture Benefits** ✅

### **Centralized Data Management**
- Single API layer for all consumer applications
- Consistent data access patterns and error handling
- Centralized monitoring and logging

### **Enhanced Security**
- No direct database credentials in client applications
- Centralized authentication and authorization
- API rate limiting and request validation

### **Scalability & Performance**
- Support for multiple consumer applications
- Optimized data transformation and caching
- Reduced database connection overhead

### **Developer Experience**
- Type-safe API client with comprehensive interfaces
- Automatic retry logic and error recovery
- Optimized React Query integration

### **Future-Proof Design**
- Ready for real-time data streaming
- Extensible API with versioning support
- Support for additional ha-ingestor features

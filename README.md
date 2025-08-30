# HA-Cleanup

A mobile-first web application for analyzing Home Assistant historical data from ha-ingestor deployments.

## 🎯 **Project Overview**

HA-Cleanup is a lightweight, focused analytics tool that integrates seamlessly with existing ha-ingestor deployments. It provides an intuitive interface for identifying issues, anomalies, and inefficiencies in smart home systems while generating actionable suggestions through an approval workflow system.

### **Key Features**
- **Historical Data Viewer**: Browse and filter Home Assistant events
- **Anomaly Detection**: Identify unusual patterns and potential issues
- **Performance Analytics**: Track system efficiency and optimization opportunities
- **Smart Suggestions**: Generate actionable recommendations with approval workflow
- **Mobile-First Design**: Optimized for mobile devices with responsive desktop support

## 🚀 **Quick Start**

### **Prerequisites**
- ha-ingestor must be deployed and running with API endpoints
- ha-ingestor API must be accessible from ha-cleanup container
- Node.js 20+ and npm/yarn

## 🔌 **API-First Architecture** ✅

### **What Changed**
- **Before**: Direct InfluxDB access through InfluxDB client
- **After**: Centralized data access through ha-ingestor RESTful API

### **Benefits**
- **Enhanced Security**: No database credentials in client applications
- **Better Scalability**: Support for multiple consumer applications
- **Improved Performance**: Optimized caching and request deduplication
- **Centralized Management**: Single source of truth for data access logic
- **Future-Proof**: Ready for real-time streaming and additional features

### **New Features Available**
- **Enhanced Data Hooks**: `useEvents`, `useMetrics`, `useDataExport`, `useCustomQuery`
- **Data Export**: JSON, CSV, and XML format support
- **Custom Queries**: Execute sanitized Flux queries through API
- **API Health Monitoring**: Connection status and latency tracking
- **Advanced Filtering**: Domain, entity, and time-based filtering

### **Migration Guide**
See [MIGRATION_TO_API.md](MIGRATION_TO_API.md) for detailed migration instructions and examples.

### **Development Setup**
```bash
# Clone the repository
git clone <repository-url>
cd ha-cleanup

# Install dependencies
npm install

# Start development server with mock data
npm run dev:mock

# Start development server with real data
npm run dev
```

### **Docker Deployment**
```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f ha-cleanup
```

## 🏗️ **Project Structure**

```
ha-cleanup/
├── .agent-os/                    # Agent OS configuration and standards
│   ├── product/                  # Product requirements and roadmap
│   ├── standards/                # Development standards and patterns
│   ├── instructions/             # AI development instructions
│   └── config.yml               # Agent OS configuration
├── src/                          # Source code
│   ├── components/               # React components
│   ├── hooks/                    # Custom React hooks
│   ├── pages/                    # Page components
│   ├── services/                 # API and data services
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Utility functions
├── examples/                     # Pattern examples and demonstrations
├── public/                       # Static assets
├── tests/                        # Test files
└── docs/                         # Documentation
```

## 🛠️ **Technology Stack**

### **Frontend**
- **React 18+** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS 3.4+** for utility-first styling
- **Headless UI** and **Radix UI** for accessible components
- **React Query** for data fetching and caching
- **React Router** for client-side routing

### **Backend**
- **Node.js 20+** with Express.js
- **ha-ingestor API** for centralized data access
- **HAIngestorAPIClient** for type-safe API integration
- **SQLite** for local data storage
- **Zod** for runtime validation

### **Development Tools**
- **TypeScript** for type safety
- **ESLint** and **Prettier** for code quality
- **Jest** and **React Testing Library** for testing
- **Playwright** for E2E testing

## 📱 **Mobile-First Design**

### **Design Principles**
- **Mobile-first approach**: Design for mobile devices first, then enhance for desktop
- **Touch-friendly interactions**: Minimum 44px touch targets, proper spacing
- **Responsive design**: Fluid layouts that adapt to all screen sizes
- **PWA capabilities**: Offline support and app-like experience

### **Breakpoints**
- **Mobile**: Default (320px+)
- **Tablet**: `md:` (768px+)
- **Desktop**: `lg:` (1024px+)
- **Large Desktop**: `xl:` (1280px+)

## 🔗 **Integration with ha-ingestor**

### **Data Access**
- **API-First Architecture**: Centralized data access through ha-ingestor RESTful API
- **HAIngestorAPIClient**: Type-safe API client with enhanced error handling and retry logic
- **Backward Compatibility**: All existing functionality continues to work
- **Enhanced Features**: Pagination, aggregation, export, and custom query support
- **Performance Optimization**: Smart caching and request deduplication through React Query

### **Deployment**
- Runs alongside ha-ingestor in Docker environment
- Shares network access for InfluxDB communication
- Independent deployment and scaling
- Coordinated updates and maintenance

## 📚 **Development Guidelines**

### **Context7 Standards**
This project follows Context7 standards for optimal AI development experience. Always refer to:

1. **`.agent-os/instructions/ai-development.md`** - AI development instructions
2. **`.agent-os/standards/context7-standards.md`** - Context7 implementation standards
3. **`.agent-os/standards/tech-stack.md`** - Technology stack details
4. **`.agent-os/product/`** - Product requirements and roadmap

### **Code Patterns**
- Use established React functional component patterns
- Implement proper loading and error states
- Follow mobile-first responsive design
- Include comprehensive TypeScript types
- Add AI ASSISTANT CONTEXT documentation

### **Component Examples**
Reference the `examples/` directory for established patterns:
- `examples/component_patterns_demo.tsx` - Basic component patterns
- Additional pattern files will be added as the project evolves

## 🧪 **Testing**

### **Unit Testing**
```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### **E2E Testing**
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui
```

### **Testing Standards**
- Test all component logic and user interactions
- Mock external dependencies and API calls
- Ensure accessibility requirements are met
- Test responsive behavior across breakpoints

## 📖 **Documentation**

### **AI Development**
- **AI ASSISTANT CONTEXT**: All public components and functions include AI context
- **Pattern References**: Clear indication of established patterns
- **Related Files**: Links to related implementation files
- **Common Modifications**: Explanation of typical changes

### **User Documentation**
- **Installation Guide**: Step-by-step setup instructions
- **Configuration**: Environment variables and settings
- **API Reference**: Backend API documentation
- **User Guide**: Application usage and features

## 🚀 **Deployment**

### **Development Environment**
```bash
# Start with mock data for rapid iteration
npm run dev:mock

# Start with real ha-ingestor data
npm run dev
```

### **Production Environment**
```bash
# Build production bundle
npm run build

# Start production server
npm start

# Docker deployment
docker-compose -f docker-compose.production.yml up -d
```

### **Environment Variables**
```bash
# ha-ingestor API Configuration
VITE_HA_INGESTOR_API_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3
VITE_API_ENABLE_LOGGING=true

# Legacy InfluxDB (for fallback)
VITE_INFLUXDB_URL=http://ha-ingestor:8086
VITE_INFLUXDB_TOKEN=your-token
VITE_INFLUXDB_ORG=your-org
VITE_INFLUXDB_BUCKET=home_assistant

# Application settings
NODE_ENV=production
PORT=3000
```

## 🤝 **Contributing**

### **Development Workflow**
1. **Plan**: Define requirements and acceptance criteria
2. **Implement**: Follow Context7 patterns and standards
3. **Test**: Write comprehensive tests
4. **Document**: Update documentation and examples
5. **Review**: Ensure Context7 compliance

### **Code Review Checklist**
- [ ] Follows React functional component patterns
- [ ] Implements proper error handling and loading states
- [ ] Uses TypeScript with proper type definitions
- [ ] Follows mobile-first design principles
- [ ] Implements accessibility requirements
- [ ] Includes AI ASSISTANT CONTEXT documentation
- [ ] Follows Context7 standards and patterns
- [ ] Tests written and passing

## 📋 **Roadmap**

### **Phase 1: Core MVP (Weeks 1-4)** ✅ **COMPLETED**
- [x] Project setup and documentation
- [x] Basic UI framework with mobile-first design
- [x] **API-First Architecture**: ha-ingestor API integration with HAIngestorAPIClient
- [x] Event browser with basic filtering
- [x] Simple charts for data visualization
- [x] Mock data mode for rapid iteration

### **Phase 2: Analysis & Insights (Weeks 5-8)** 🚀 **IN PROGRESS**
- [x] **API Integration**: Complete ha-ingestor API integration with enhanced features
- [x] **Enhanced Data Access**: Pagination, aggregation, and export capabilities
- [ ] Pattern recognition and anomaly detection
- [ ] Performance metrics and efficiency indicators
- [ ] Suggestion engine and approval workflow
- [x] Enhanced charts with interactive features
- [x] **Export Functionality**: JSON, CSV, and XML export support

### **Phase 3: Polish & Optimization (Weeks 9-12)**
- [ ] Advanced analytics and trend detection
- [ ] Custom dashboards and user preferences
- [ ] PWA features and offline capabilities
- [x] **Performance Optimization**: API-enabled optimizations with React Query
- [x] **Advanced Filtering**: Complex query building and saved filters
- [ ] Notification system and alerts

## 🐛 **Troubleshooting**

### **Common Issues**
1. **Connection to ha-ingestor**: Check network access and InfluxDB credentials
2. **Build errors**: Ensure Node.js version compatibility
3. **Mobile responsiveness**: Test on actual mobile devices
4. **Performance issues**: Use React DevTools profiler

### **Debug Tools**
- **React DevTools**: Component inspection and profiling
- **React Query DevTools**: Query state and cache inspection
- **Browser DevTools**: Network, performance, and accessibility
- **TypeScript**: Compile-time error checking

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **ha-ingestor**: For providing the data infrastructure
- **Home Assistant**: For the smart home automation platform
- **React Community**: For the excellent frontend framework
- **Tailwind CSS**: For the utility-first CSS framework

---

**For AI Development**: Always start with `.agent-os/instructions/ai-development.md` and follow Context7 standards for optimal development experience.

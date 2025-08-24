# Tech Stack Standards for ha-cleanup

## Context
This document defines the tech stack standards specifically for the ha-cleanup project - a mobile-first web application for analyzing Home Assistant historical data from ha-ingestor deployments. These standards ensure optimal Cursor.ai performance and Context7 integration.

> **Project Focus**: React + TypeScript frontend with Node.js backend, designed to run alongside ha-ingestor in a Docker environment.

---

## High-Level Architecture
- **Frontend:** React 18+ with TypeScript, mobile-first design, PWA capabilities
- **Backend:** Node.js 20+ with Express.js, RESTful API for data access
- **Data Source:** Read-only access to existing InfluxDB from ha-ingestor deployment
- **Local Storage:** SQLite for suggestion tracking and user preferences
- **Deployment:** Docker container alongside ha-ingestor, local network deployment
- **Development:** Vite for fast development, mock data mode for rapid iteration

---

## Core Technologies & Versions

### Languages & Runtimes
- **Node.js:** 20+ LTS (ESM by default)
- **TypeScript:** 5.0+ (strict mode enabled)
- **React:** 18+ (with concurrent features)

### Frontend Framework & Tools
- **Framework:** **React 18+** with TypeScript
- **Build Tool:** **Vite** (fast development and building)
- **Package Manager:** **npm** or **yarn** (with lock files)
- **Styling:** **Tailwind CSS 3.4+** (utility-first approach)
- **State Management:** **React Query** for server state, **Zustand** for client state
- **Routing:** **React Router 6+** for client-side navigation

### UI Components & Libraries
- **Component Library:** **Headless UI** for accessible, unstyled components
- **Advanced Components:** **Radix UI** for complex component primitives
- **Icons:** **Heroicons** (primary) + **Lucide React** (additional options)
- **Fonts:** **Google Fonts** (web-safe typography)
- **Data Visualization:** **Recharts** (primary) + **D3.js** (advanced custom charts)

### Backend Framework & Tools
- **Framework:** **Express.js** with TypeScript
- **HTTP Middleware:** **CORS**, **Helmet** (security), **Morgan** (logging)
- **Data Access:** **InfluxDB Client** for ha-ingestor data, **SQLite3** for local data
- **Validation:** **Zod** for runtime type validation
- **Error Handling:** Custom error middleware with structured logging

### Database & Data Access
- **Primary Data:** **InfluxDB 2.7+** (read-only access from ha-ingestor)
- **Local Storage:** **SQLite** for suggestions, user preferences, and metadata
- **Data Processing:** **InfluxDB Flux queries** for time-series analysis
- **Caching:** **React Query** for frontend caching, **Redis** (optional for backend)

---

## Development Tools & Quality

### Code Quality & Linting
- **Linting:** **ESLint** with TypeScript rules
- **Formatting:** **Prettier** with project-specific configuration
- **Type Checking:** **TypeScript** strict mode
- **Testing:** **Jest** + **React Testing Library** for frontend, **Supertest** for backend
- **E2E Testing:** **Playwright** for cross-browser testing

### Development Workflow
- **Version Control:** **Git** with conventional commits
- **Pre-commit Hooks:** **Husky** + **lint-staged**
- **Code Review:** **GitHub PRs** with required checks
- **CI/CD:** **GitHub Actions** for automated testing and deployment

---

## Mobile-First Design Standards

### Responsive Design
- **Breakpoints:** Mobile-first approach with Tailwind CSS breakpoints
- **Touch Interactions:** Touch-friendly buttons, gestures, and navigation
- **Performance:** Optimized for mobile devices with lazy loading
- **PWA Features:** Service worker, offline capabilities, app-like experience

### Component Standards
- **Accessibility:** WCAG 2.1 AA compliance, ARIA labels, keyboard navigation
- **Performance:** Lazy loading, code splitting, optimized bundle size
- **Responsiveness:** Fluid layouts, flexible grids, adaptive typography

---

## Context7 Integration Standards

### AI Development Workflow
- **Step 1**: Always start with `.agent-os/instructions/ai-development.md`
- **Step 2**: Reference established patterns from examples
- **Step 3**: Follow Context7 standards for consistency
- **Step 4**: Document new patterns in Context7 structure

### Code Organization Standards
- **Components**: Must follow React functional component patterns
- **Hooks**: Must use custom hooks for reusable logic
- **API Calls**: Must use React Query for data fetching and caching
- **State Management**: Must use appropriate state management patterns
- **Error Handling**: Must implement proper error boundaries and fallbacks

### Documentation Standards
- **AI ASSISTANT CONTEXT**: All public components and functions
- **Implementation Examples**: Reference to examples directory
- **Pattern Usage**: Clear indication of established patterns
- **Related Files**: Links to related implementation files

---

## Performance & Optimization

### Frontend Performance
- **Bundle Optimization:** Code splitting, tree shaking, dynamic imports
- **Image Optimization:** WebP format, lazy loading, responsive images
- **Caching Strategy:** Service worker caching, browser caching headers
- **Core Web Vitals:** Optimize LCP, FID, CLS metrics

### Backend Performance
- **Database Queries:** Optimized InfluxDB Flux queries
- **Caching:** Redis caching for frequently accessed data
- **Rate Limiting:** Implement rate limiting for API endpoints
- **Compression:** Gzip compression for API responses

---

## Security Standards

### Frontend Security
- **Content Security Policy:** Implement CSP headers
- **XSS Prevention:** Sanitize user inputs, use React's built-in protection
- **CSRF Protection:** Implement CSRF tokens for state-changing operations
- **Secure Headers:** Use Helmet.js for security headers

### Backend Security
- **Input Validation:** Zod schema validation for all inputs
- **Authentication:** JWT tokens for API access (future enhancement)
- **Rate Limiting:** Prevent abuse and DDoS attacks
- **CORS Configuration:** Proper CORS setup for production

---

## Deployment & Infrastructure

### Containerization
- **Docker:** Multi-stage builds for optimized images
- **Docker Compose:** Local development and testing
- **Health Checks:** Implement proper health check endpoints
- **Environment Variables:** Use .env files for configuration

### Monitoring & Observability
- **Logging:** Structured logging with correlation IDs
- **Metrics:** Prometheus metrics for application performance
- **Health Checks:** Health check endpoints for container orchestration
- **Error Tracking:** Implement error tracking and alerting

---

## Integration with ha-ingestor

### Data Access
- **InfluxDB Connection:** Read-only access to ha-ingestor InfluxDB
- **Data Schema:** Follow ha-ingestor data structure and naming conventions
- **Query Patterns:** Use established Flux query patterns from ha-ingestor
- **Performance:** Optimize queries for large time-series datasets

### Deployment Coordination
- **Network Access:** Ensure ha-cleanup can reach ha-ingestor services
- **Configuration:** Share configuration patterns with ha-ingestor
- **Monitoring:** Integrate with ha-ingestor monitoring stack
- **Updates:** Coordinate updates and deployments

---

## Future Considerations

### Phase 2 Enhancements
- **Real-time Data:** WebSocket integration with ha-ingestor
- **Advanced Analytics:** Machine learning for improved suggestions
- **User Management:** Authentication and user preferences
- **API Extensions:** Third-party integrations and webhooks

### Phase 3 Optimizations
- **Performance:** Advanced caching and optimization strategies
- **Scalability:** Horizontal scaling and load balancing
- **Advanced Features:** Custom dashboards and advanced filtering
- **Enterprise Features:** Multi-tenant support and advanced security

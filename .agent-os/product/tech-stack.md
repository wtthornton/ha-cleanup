# Technical Stack

## Application Framework
- **Node.js 20+** with Express.js for backend API
- **React 18+** with TypeScript for frontend

## Database System
- **InfluxDB 2.7+** (read-only access to existing ha-ingestor data)
- **SQLite** for local suggestion tracking and user preferences

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
- **Existing InfluxDB** from ha-ingestor deployment
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

### Backend Dependencies
- **Express.js** for REST API endpoints
- **CORS** for cross-origin resource sharing
- **Helmet** for security headers
- **Morgan** for HTTP request logging
- **InfluxDB Client** for data access

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

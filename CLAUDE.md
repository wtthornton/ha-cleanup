# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ha-cleanup is a mobile-first React web application for analyzing Home Assistant historical data from ha-ingestor deployments. It provides data visualization, anomaly detection, and actionable suggestions through an approval workflow system.

## Development Commands

### Development
```bash
# Start development server with mock data
npm run dev:mock

# Start development server with real data
npm run dev

# Install dependencies
npm install
```

### Code Quality
```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Validate Context7 compliance
npm run context7:validate
```

### Testing
```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui
```

### Production
```bash
# Build production bundle
npm run build

# Start production server
npm start

# Preview production build
npm run preview

# Docker deployment
docker-compose up -d
```

## Architecture & Standards

### Agent OS Integration
This project follows Agent OS and Context7 standards for optimal AI development:

- **Always start with**: `.agent-os/instructions/ai-development.md`
- **Reference patterns**: `examples/component_patterns_demo.tsx`
- **Follow standards**: `.agent-os/standards/context7-standards.md`
- **Check tech stack**: `.agent-os/standards/tech-stack.md`

### Technology Stack
- **Frontend**: React 18+ with TypeScript, Vite for building
- **Styling**: Tailwind CSS 3.4+ with mobile-first approach
- **Components**: Headless UI and Radix UI for accessibility
- **Data Fetching**: React Query for caching and state management
- **Charts**: Recharts for data visualization
- **Backend**: Node.js 20+ with Express.js
- **Database**: InfluxDB (read-only from ha-ingestor), SQLite for local data
- **MCP Integration**: Model Context Protocol server for AI assistant integration

### Component Patterns
All components must follow established patterns from `examples/component_patterns_demo.tsx`:

1. **Functional components** with TypeScript interfaces
2. **Loading and error states** for all data operations
3. **Mobile-first responsive design** with Tailwind CSS
4. **Accessibility features** (ARIA labels, keyboard navigation)
5. **AI ASSISTANT CONTEXT** documentation for all public components

### Data Integration
- **InfluxDB Access**: Read-only access to existing ha-ingestor data
- **React Query**: All data fetching with proper caching strategies
- **Error Handling**: Graceful handling of connection issues with ha-ingestor
- **Mock Data Mode**: Available for development without ha-ingestor connection

### Mobile-First Design
- **Breakpoints**: Mobile (default), Tablet (md: 768px+), Desktop (lg: 1024px+)
- **Touch Targets**: Minimum 44px touch targets
- **Performance**: Optimized for mobile devices
- **PWA Support**: Planned for offline capabilities

## Development Workflow

### Feature Development Process
1. **Requirements**: Review product requirements in `.agent-os/product/`
2. **Planning**: Follow Context7 patterns and standards
3. **Implementation**: Use established component patterns
4. **Testing**: Comprehensive unit and integration tests
5. **Documentation**: Include AI ASSISTANT CONTEXT comments

### Code Quality Requirements
- **TypeScript**: Strict mode with proper type definitions
- **Testing**: Unit tests for components and hooks
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Mobile-optimized with code splitting
- **Documentation**: AI context for all public interfaces

### Integration with ha-ingestor
- **Deployment**: Runs alongside ha-ingestor in Docker environment
- **Data Access**: Read-only InfluxDB queries following ha-ingestor patterns
- **Network**: Shared network access for database communication
- **Error Handling**: Graceful degradation when ha-ingestor is unavailable

## Project Structure

```
ha-cleanup/
├── .agent-os/                    # Agent OS configuration and standards
│   ├── instructions/             # AI development instructions
│   ├── standards/                # Development standards and patterns
│   └── product/                  # Product requirements and roadmap
├── examples/                     # Pattern demonstrations
│   └── component_patterns_demo.tsx  # React component patterns
├── src/                          # Source code
│   ├── components/               # React components
│   │   ├── charts/               # Chart components (BarChart, LineChart, etc.)
│   │   └── events/               # Event-related components
│   ├── config/                   # Configuration files
│   ├── hooks/                    # Custom React hooks
│   ├── pages/                    # Page components
│   ├── server/                   # Express server code
│   ├── services/                 # API and data services
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Utility functions
├── tests/                        # Test files
└── __tests__/                    # Additional test files
```

## Key Architecture Points

### Path Aliases
The project uses `@/*` path aliases that map to `./src/*` for cleaner imports. Use `@/components/Layout` instead of `../../components/Layout`.

### TypeScript Configuration  
- Strict mode enabled with `noUnusedLocals` and `noUnusedParameters`
- Modern ES2020 target with DOM and DOM.Iterable libs
- JSX configured for React 18+ with new JSX transform

## Key Files for Development

- **README.md**: Complete project documentation and setup instructions
- **.agent-os/instructions/ai-development.md**: AI development guidelines
- **.agent-os/standards/context7-standards.md**: Context7 implementation standards
- **examples/component_patterns_demo.tsx**: Established React patterns
- **.agent-os/product/**: Product requirements and roadmap

### Build Configuration
- **Vite**: Used for development server and building with hot module replacement
- **Code Splitting**: Vendor chunks automatically configured for React, charts, InfluxDB, and UI libraries
- **Mock Mode**: Use `npm run dev:mock` to enable mock data mode via `__MOCK_MODE__` global
- **Source Maps**: Enabled in production builds for debugging

### ESLint Configuration
- Extends React recommended rules with TypeScript support
- Custom rules: unused vars handled by TypeScript, prefer const over let
- Test files have relaxed rules for globals like `describe`, `it`, `expect`
- React refresh plugin for better development experience

## Environment Variables

```bash
# InfluxDB connection (when implemented)
INFLUXDB_URL=http://ha-ingestor:8086
INFLUXDB_TOKEN=your-token
INFLUXDB_ORG=your-org
INFLUXDB_BUCKET=home_assistant

# Application settings
NODE_ENV=production
PORT=3000

# Vite-specific environment variables (prefix with VITE_)
VITE_HA_INGESTOR_API_URL=http://localhost:8000
VITE_API_TIMEOUT=30000

# MCP Server Configuration
PROJECT_ROOT=.
AGENT_OS_PATH=.agent-os
NODE_ENV=development
```

## MCP Integration

This project includes full Context7 MCP (Model Context Protocol) integration:

### MCP Commands
```bash
# Start MCP server for development
npm run mcp:dev

# Test MCP server functionality
npm run mcp:test

# Validate Context7 compliance
npm run context7:validate
```

### MCP Features
- **Real-time Context7 Access**: AI assistants can access project standards in real-time
- **Code Validation Tools**: Automated Context7 compliance checking
- **Pattern Examples**: Access to established React component patterns
- **Naming Convention Checks**: Validate file and component naming
- **Improvement Suggestions**: Context7-aware code improvement recommendations
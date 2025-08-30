# AGENTS.md

## Project Overview
Mobile-first React web application for analyzing Home Assistant historical data from ha-ingestor deployments. Provides data visualization, anomaly detection, and actionable suggestions through an approval workflow system.

This project is optimized for AI coding agent integration with Context7 standards and MCP (Model Context Protocol) support.

## Setup Commands
```bash
# Install dependencies
npm install

# Start development with mock data
npm run dev:mock

# Start development with real data
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture
- **Frontend**: React 18+ with TypeScript, Vite for building
- **Styling**: Tailwind CSS 3.4+ with mobile-first approach
- **Components**: Headless UI and Radix UI for accessibility
- **Data Fetching**: React Query for caching and state management
- **Charts**: Recharts for data visualization
- **Backend**: Node.js 20+ with Express.js
- **Database**: InfluxDB (read-only from ha-ingestor), SQLite for local data

## Code Style
- Use TypeScript strict mode with proper type definitions
- Follow React 18+ patterns with functional components and hooks
- Implement mobile-first responsive design with Tailwind CSS
- Use ESLint and Prettier configurations (run `npm run lint` and `npm run format`)
- Path aliases: Use `@/*` for src imports (e.g., `@/components/Layout`)

## File Naming Conventions
- Components: PascalCase (e.g., `EventList.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useInfluxData.ts`)
- Utilities: camelCase (e.g., `chartUtils.ts`)
- Types: camelCase (e.g., `app.ts`, `influxdb.ts`)

## Component Patterns
All components must follow established patterns:
1. Functional components with TypeScript interfaces
2. Loading and error states for all data operations
3. Mobile-first responsive design with Tailwind CSS
4. Accessibility features (ARIA labels, keyboard navigation)
5. AI ASSISTANT CONTEXT documentation for all public components

## Import Organization
```typescript
// React imports first
import React, { useState } from 'react'

// Third-party libraries
import { useQuery } from '@tanstack/react-query'

// Internal components and hooks
import { Layout } from '@/components/Layout'
import { useInfluxData } from '@/hooks/useInfluxData'

// Types and utilities
import type { Event } from '@/types/app'
import { formatDate } from '@/utils/chartUtils'

// Relative imports last
import './Component.css'
```

## Testing
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

## Testing Standards
- Write tests for all new components and hooks using Vitest and React Testing Library
- Mock external dependencies and API calls
- Test mobile responsiveness across breakpoints
- Maintain high test coverage
- Test accessibility requirements

## Data Integration
- **API-First Architecture**: Use ha-ingestor RESTful API through HAIngestorAPIClient
- **React Query**: All data fetching with proper caching strategies
- **Error Handling**: Graceful handling of connection issues with ha-ingestor
- **Mock Data Mode**: Available via `npm run dev:mock` for development without ha-ingestor connection

## Mobile-First Design
- **Breakpoints**: Mobile (default), Tablet (md: 768px+), Desktop (lg: 1024px+)
- **Touch Targets**: Minimum 44px touch targets, proper spacing
- **Performance**: Optimized for mobile devices with code splitting
- **PWA Support**: Planned for offline capabilities

## Development Standards
- Keep components small and focused
- Use custom hooks for data fetching and state management
- Implement proper error boundaries and loading states
- Use React Query for server state management
- Follow the established folder structure in `src/`
- Include AI ASSISTANT CONTEXT comments for all public interfaces

## Environment Variables
Prefix client-side variables with `VITE_`:
```bash
VITE_HA_INGESTOR_API_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
VITE_INFLUXDB_URL=http://ha-ingestor:8086
VITE_INFLUXDB_TOKEN=your-token
```

## Key Dependencies
- `@tanstack/react-query` - Data fetching and caching
- `@headlessui/react` - Accessible UI components
- `@radix-ui/*` - Additional accessible components
- `recharts` - Data visualization
- `@influxdata/influxdb-client` - Database client
- `tailwindcss` - CSS framework
- `vitest` - Testing framework
- `@playwright/test` - E2E testing

## Project Structure
```
src/
├── components/          # React components
│   ├── charts/         # Chart components (BarChart, LineChart, etc.)
│   └── events/         # Event-related components
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API and data services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Agent OS Integration
This project follows Agent OS and Context7 standards with full MCP integration:
- Reference `.agent-os/instructions/ai-development.md` for AI development guidelines
- Follow patterns in `examples/component_patterns_demo.tsx`
- Check `.agent-os/standards/context7-standards.md` for implementation standards
- Review product requirements in `.agent-os/product/`

## MCP (Model Context Protocol) Integration
The project includes a Context7 MCP server for real-time AI assistant integration:
- **MCP Server**: `src/mcp-server.js` - Provides Context7 resources, tools, and prompts
- **Test MCP**: `npm run mcp:test` - Validate MCP server functionality
- **Validate Context7**: `npm run context7:validate` - Check Context7 compliance
- **Resources**: Real-time access to standards, patterns, and documentation
- **Tools**: Code validation, pattern examples, naming conventions, and improvements
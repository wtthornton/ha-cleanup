# AI Development Instructions for ha-cleanup

## Overview
This document provides AI development instructions specifically for the ha-cleanup project - a mobile-first React application for analyzing Home Assistant historical data. Follow these instructions to ensure optimal Cursor.ai performance and consistent development patterns.

## 🚀 **Getting Started with AI Development**

### **Step 1: Always Start Here**
1. **Read this file first** - Understand the project context and requirements
2. **Check Context7 standards** - Review `.agent-os/standards/context7-standards.md`
3. **Review tech stack** - Check `.agent-os/standards/tech-stack.md`
4. **Understand product requirements** - Review `.agent-os/product/mission.md`

### **Step 2: Project Context Understanding**
- **Project Type**: Mobile-first React web application
- **Purpose**: Analyze Home Assistant historical data from ha-ingestor
- **Target Users**: Home Assistant enthusiasts and administrators
- **Key Features**: Historical data viewing, analytics, suggestion generation
- **Development Approach**: Frontend-first with mock data, then backend integration

## 🎯 **Development Priorities**

### **Phase 1 Focus (Current)**
- **Mobile-first UI design** with Tailwind CSS
- **React functional components** with TypeScript
- **Mock data mode** for rapid iteration
- **Basic navigation** and responsive layout
- **Component library setup** with Headless UI and Radix UI

### **Phase 2 Focus (Next)**
- **Data visualization** with Recharts and D3.js
- **Suggestion engine** and approval workflow
- **Performance analytics** and pattern recognition
- **Enhanced charts** with interactive features

### **Phase 3 Focus (Future)**
- **Advanced analytics** and trend detection
- **PWA features** and offline capabilities
- **Performance optimization** and advanced filtering
- **Custom dashboards** and user preferences

## 🔧 **Technical Implementation Standards**

### **React Component Patterns**
```typescript
// Always use functional components with TypeScript
interface ComponentProps {
  /** AI ASSISTANT CONTEXT: Component purpose and usage */
  title: string;
  data?: any[];
  onAction?: (data: any) => void;
}

export const ExampleComponent: React.FC<ComponentProps> = ({ 
  title, 
  data, 
  onAction 
}) => {
  // Component implementation
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      {/* Component content */}
    </div>
  );
};
```

### **Data Fetching Patterns**
```typescript
// Use React Query for all data fetching
import { useQuery } from '@tanstack/react-query';

export const useHomeAssistantData = (entityId: string, timeRange: string) => {
  return useQuery({
    queryKey: ['ha-data', entityId, timeRange],
    queryFn: () => fetchHomeAssistantData(entityId, timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

### **State Management Patterns**
```typescript
// Use local state for component-specific state
const [localState, setLocalState] = useState(initialValue);

// Use React Query for server state
const { data, mutate } = useMutation({
  mutationFn: updateData,
  onSuccess: () => {
    // Handle success
  },
  onError: (error) => {
    // Handle error
  },
});
```

### **Error Handling Patterns**
```typescript
// Always provide loading and error states
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;

// Use error boundaries for unexpected errors
<ErrorBoundary fallback={<ErrorFallback />}>
  <Component />
</ErrorBoundary>
```

## 🎨 **UI/UX Implementation Standards**

### **Mobile-First Design**
```typescript
// Use Tailwind CSS responsive classes
<div className="p-4 md:p-6 lg:p-8">
  <button className="w-full md:w-auto px-4 py-2">
    Action
  </button>
</div>

// Touch-friendly interactions
<button className="min-h-[44px] px-4 py-2 touch-manipulation">
  Touch Target
</button>
```

### **Accessibility Standards**
```typescript
// Always include proper ARIA labels
<button 
  aria-label="Close dialog"
  className="p-2"
>
  <XIcon className="w-5 h-5" />
</button>

// Provide alternative text for images
<img 
  src="/chart.png" 
  alt="Temperature chart showing daily variations"
  className="w-full h-auto"
/>
```

### **Data Visualization Standards**
```typescript
// Use Recharts for standard charts
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const TemperatureChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="temperature" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

## 📱 **Mobile Optimization Standards**

### **Touch Interactions**
- **Minimum touch target**: 44px × 44px
- **Touch feedback**: Visual feedback for all touch interactions
- **Gesture support**: Swipe, pinch, and tap gestures where appropriate
- **Touch delay**: Minimize touch delay for responsive feel

### **Performance Optimization**
- **Lazy loading**: Implement lazy loading for images and components
- **Code splitting**: Use React.lazy() for route-based code splitting
- **Bundle optimization**: Minimize bundle size with tree shaking
- **Caching**: Implement proper caching strategies for data and assets

### **Responsive Design**
- **Breakpoints**: Use Tailwind CSS breakpoints (sm, md, lg, xl)
- **Fluid layouts**: Design layouts that adapt to different screen sizes
- **Typography**: Use responsive typography scales
- **Spacing**: Implement consistent spacing systems

## 🔗 **Integration with ha-ingestor**

### **Data Access Patterns**
```typescript
// InfluxDB data access
export const useInfluxDBData = (query: string) => {
  return useQuery({
    queryKey: ['influxdb', query],
    queryFn: () => fetchInfluxDBData(query),
    staleTime: 1 * 60 * 1000, // 1 minute for real-time data
  });
};

// Handle connection issues gracefully
export const useInfluxDBConnection = () => {
  const { data, error } = useQuery({
    queryKey: ['influxdb-connection'],
    queryFn: checkInfluxDBConnection,
    retry: 3,
    retryDelay: 1000,
  });

  return {
    isConnected: !!data,
    error,
  };
};
```

### **Error Handling for External Dependencies**
```typescript
// Handle ha-ingestor connection issues
const { isConnected, error: connectionError } = useInfluxDBConnection();

if (connectionError) {
  return (
    <div className="p-4 text-red-600">
      <h3>Connection Error</h3>
      <p>Unable to connect to ha-ingestor. Please check your configuration.</p>
      <details className="mt-2">
        <summary>Error details</summary>
        <pre className="mt-2 text-sm">{connectionError.message}</pre>
      </details>
    </div>
  );
}
```

## 📚 **Development Workflow**

### **Component Development Process**
1. **Plan**: Define component purpose and requirements
2. **Design**: Create mobile-first responsive design
3. **Implement**: Follow React functional component patterns
4. **Test**: Write unit tests for component logic
5. **Document**: Add AI ASSISTANT CONTEXT comments
6. **Review**: Ensure Context7 compliance

### **Feature Development Process**
1. **Requirements**: Understand feature requirements from product roadmap
2. **Design**: Create UI/UX design with mobile-first approach
3. **Implementation**: Follow established patterns and standards
4. **Testing**: Implement comprehensive testing strategy
5. **Documentation**: Update documentation and examples
6. **Review**: Code review with Context7 compliance check

### **Code Review Checklist**
- [ ] Follows React functional component patterns
- [ ] Implements proper error handling and loading states
- [ ] Uses TypeScript with proper type definitions
- [ ] Follows mobile-first design principles
- [ ] Implements accessibility requirements
- [ ] Includes AI ASSISTANT CONTEXT documentation
- [ ] Follows Context7 standards and patterns
- [ ] Tests written and passing

## 🧪 **Testing Standards**

### **Unit Testing**
```typescript
// Test component rendering and behavior
import { render, screen } from '@testing-library/react';
import { ExampleComponent } from './ExampleComponent';

describe('ExampleComponent', () => {
  it('renders with title', () => {
    render(<ExampleComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    render(<ExampleComponent title="Test" isLoading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

### **Integration Testing**
```typescript
// Test component integration with React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('DataComponent', () => {
  it('fetches and displays data', async () => {
    render(
      <TestWrapper>
        <DataComponent entityId="test" />
      </TestWrapper>
    );
    
    expect(await screen.findByText('Data loaded')).toBeInTheDocument();
  });
});
```

## 📖 **Documentation Standards**

### **AI ASSISTANT CONTEXT Requirements**
```typescript
/**
 * AI ASSISTANT CONTEXT: Component purpose and usage description
 * 
 * Key Patterns Used:
 * - React functional component with TypeScript
 * - React Query for data fetching
 * - Tailwind CSS for styling
 * - Error boundary for error handling
 * 
 * Common Modifications:
 * - Styling changes with Tailwind classes
 * - Component prop adjustments
 * - Data fetching modifications
 * 
 * Related Files:
 * - examples/component_patterns_demo.tsx
 * - src/hooks/useDataFetching.ts
 * - src/components/ErrorBoundary.tsx
 */
```

### **Code Comments**
- **Purpose**: Explain why, not what
- **Patterns**: Reference established patterns
- **Dependencies**: Document component dependencies
- **Modifications**: Explain common modification points

## 🚨 **Common Pitfalls to Avoid**

### **Performance Issues**
- ❌ **Don't**: Create components without proper memoization
- ❌ **Don't**: Fetch data without React Query caching
- ❌ **Don't**: Render large lists without virtualization
- ✅ **Do**: Use React.memo() for expensive components
- ✅ **Do**: Implement proper loading and error states
- ✅ **Do**: Use code splitting for large components

### **Mobile Experience Issues**
- ❌ **Don't**: Design for desktop first
- ❌ **Don't**: Use small touch targets
- ❌ **Don't**: Ignore mobile performance
- ✅ **Do**: Design mobile-first with progressive enhancement
- ✅ **Do**: Use 44px minimum touch targets
- ✅ **Do**: Optimize for mobile performance

### **Accessibility Issues**
- ❌ **Don't**: Ignore ARIA labels
- ❌ **Don't**: Use color alone for information
- ❌ **Don't**: Ignore keyboard navigation
- ✅ **Do**: Include proper ARIA labels
- ✅ **Do**: Provide multiple ways to convey information
- ✅ **Do**: Ensure keyboard navigation works

## 🔍 **Debugging and Troubleshooting**

### **Common Issues**
1. **React Query not working**: Check QueryClient provider setup
2. **TypeScript errors**: Ensure proper type definitions
3. **Styling issues**: Verify Tailwind CSS configuration
4. **Mobile responsiveness**: Test on actual mobile devices
5. **Performance problems**: Use React DevTools profiler

### **Debugging Tools**
- **React DevTools**: Component inspection and profiling
- **React Query DevTools**: Query state and cache inspection
- **Browser DevTools**: Network, performance, and accessibility
- **TypeScript**: Compile-time error checking
- **ESLint**: Code quality and style checking

## 📚 **Resources and References**

### **Essential Documentation**
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Headless UI Documentation](https://headlessui.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)

### **Project-Specific Resources**
- `.agent-os/standards/context7-standards.md` - Context7 standards
- `.agent-os/standards/tech-stack.md` - Technology stack details
- `.agent-os/product/mission.md` - Product requirements
- `.agent-os/product/roadmap.md` - Development roadmap
- `examples/` - Pattern examples and demonstrations

---

## 🎯 **Success Metrics**

### **Development Quality**
- **Context7 Compliance**: 100% adherence to established patterns
- **TypeScript Coverage**: 100% type coverage
- **Test Coverage**: >90% test coverage
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Core Web Vitals optimization

### **User Experience**
- **Mobile Performance**: Fast loading on mobile devices
- **Touch Experience**: Smooth and responsive touch interactions
- **Accessibility**: Usable by all users regardless of abilities
- **Responsiveness**: Consistent experience across all screen sizes

---

**Remember**: Always start with Context7 standards and established patterns. Don't reinvent the wheel - use what's already proven to work in this project!

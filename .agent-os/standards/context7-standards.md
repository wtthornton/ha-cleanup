# Context7 Standards for ha-cleanup

## Overview
This document defines Context7-specific standards and patterns for the ha-cleanup project - a mobile-first React application for analyzing Home Assistant historical data. These standards ensure optimal Cursor.ai performance and consistent development patterns.

## 🎯 **Context7 Integration Standards**

### **1. Project Structure Compliance**
- **Required**: All new features must follow Context7 patterns
- **Required**: Use established base classes and hooks from examples
- **Required**: Follow React functional component patterns
- **Required**: Implement proper error handling and loading states

### **2. AI Development Workflow**
- **Step 1**: Always start with `.agent-os/instructions/ai-development.md`
- **Step 2**: Reference established patterns from examples
- **Step 3**: Follow Context7 standards for consistency
- **Step 4**: Document new patterns in Context7 structure

### **3. Code Organization Standards**
- **Components**: Must follow React functional component patterns
- **Hooks**: Must use custom hooks for reusable logic
- **API Calls**: Must use React Query for data fetching and caching
- **State Management**: Must use appropriate state management patterns
- **Error Handling**: Must implement proper error boundaries and fallbacks

## 🔧 **Context7 Implementation Standards**

### **React Component Implementation**
```typescript
import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface ComponentProps {
  /** AI ASSISTANT CONTEXT: Component props description */
  title: string;
  data?: any[];
}

export const ExampleComponent: React.FC<ComponentProps> = ({ title, data }) => {
  /** AI ASSISTANT CONTEXT: Custom hook for data fetching */
  const { data: queryData, isLoading, error } = useQuery({
    queryKey: ['example', title],
    queryFn: () => fetchExampleData(title),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      {/* Component implementation */}
    </div>
  );
};
```

### **Custom Hook Implementation**
```typescript
import { useState, useEffect } from 'react';

/** AI ASSISTANT CONTEXT: Custom hook for managing component state */
export const useExampleHook = (initialValue: string) => {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Hook logic implementation
  }, [value]);

  return { value, setValue, isLoading };
};
```

### **API Integration Pattern**
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

/** AI ASSISTANT CONTEXT: API integration using React Query */
export const useHomeAssistantData = (entityId: string, timeRange: string) => {
  return useQuery({
    queryKey: ['ha-data', entityId, timeRange],
    queryFn: () => fetchHomeAssistantData(entityId, timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSuggestionMutation = () => {
  return useMutation({
    mutationFn: (suggestion: Suggestion) => updateSuggestion(suggestion),
    onSuccess: () => {
      // Handle success
    },
    onError: (error) => {
      // Handle error
    },
  });
};
```

### **Error Boundary Implementation**
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/** AI ASSISTANT CONTEXT: Error boundary for catching component errors */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-red-600">
          <h2>Something went wrong.</h2>
          <details className="mt-2">
            <summary>Error details</summary>
            <pre className="mt-2 text-sm">{this.state.error?.message}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 📚 **Context7 Documentation Standards**

### **Required Documentation**
- **AI ASSISTANT CONTEXT**: All public components and functions
- **Implementation Examples**: Reference to examples directory
- **Pattern Usage**: Clear indication of established patterns
- **Related Files**: Links to related implementation files

### **Documentation Format**
```typescript
/**
 * AI ASSISTANT CONTEXT: Brief description of purpose and patterns.
 * 
 * Key Patterns Used:
 * - React functional components with TypeScript
 * - React Query for data fetching and caching
 * - Custom hooks for reusable logic
 * - Error boundaries for error handling
 * 
 * Common Modifications:
 * - Styling changes with Tailwind CSS
 * - Component prop adjustments
 * - API integration modifications
 * 
 * Related Files:
 * - examples/component_patterns_demo.tsx
 * - src/hooks/useDataFetching.ts
 * - src/components/ErrorBoundary.tsx
 */
```

## 🚀 **Context7 Quality Standards**

### **Code Quality Requirements**
- **TypeScript**: Strict mode enabled, proper type definitions
- **ESLint**: No linting errors, consistent code style
- **Prettier**: Consistent formatting across the codebase
- **Testing**: Unit tests for components and hooks
- **Accessibility**: WCAG 2.1 AA compliance

### **Performance Requirements**
- **Bundle Size**: Optimized bundle with code splitting
- **Loading States**: Proper loading indicators for async operations
- **Error Handling**: Graceful error handling with user feedback
- **Mobile Optimization**: Touch-friendly interactions and responsive design

## 🎨 **UI/UX Standards**

### **Component Design Patterns**
- **Mobile-First**: Design for mobile devices first, then enhance for desktop
- **Touch-Friendly**: Minimum 44px touch targets, proper spacing
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Consistency**: Use established design system and component library

### **Data Visualization Standards**
- **Charts**: Use Recharts for standard charts, D3.js for custom visualizations
- **Responsive**: Charts must adapt to different screen sizes
- **Performance**: Optimize chart rendering for large datasets
- **Accessibility**: Provide alternative text and keyboard navigation for charts

## 🔗 **Integration Standards**

### **ha-ingestor Integration**
- **Data Access**: Read-only access to InfluxDB data
- **API Patterns**: Follow established API patterns from ha-ingestor
- **Error Handling**: Handle connection issues gracefully
- **Performance**: Optimize queries for large time-series datasets

### **External Dependencies**
- **Package Management**: Use npm or yarn with lock files
- **Version Pinning**: Pin dependency versions for stability
- **Security**: Regular dependency updates and security audits
- **Compatibility**: Ensure compatibility with Node.js 20+ and React 18+

## 📋 **Development Workflow**

### **Feature Development**
1. **Planning**: Define requirements and acceptance criteria
2. **Implementation**: Follow Context7 patterns and standards
3. **Testing**: Write unit tests and integration tests
4. **Documentation**: Update documentation and examples
5. **Review**: Code review with Context7 compliance check

### **Code Review Checklist**
- [ ] Follows Context7 patterns and standards
- [ ] Proper TypeScript types and interfaces
- [ ] Error handling and loading states implemented
- [ ] Accessibility requirements met
- [ ] Performance considerations addressed
- [ ] Documentation updated
- [ ] Tests written and passing

## 🔍 **Common Patterns Reference**

### **Data Fetching Pattern**
```typescript
// Use React Query for all data fetching
const { data, isLoading, error } = useQuery({
  queryKey: ['data-key', params],
  queryFn: () => fetchData(params),
  staleTime: 5 * 60 * 1000,
});
```

### **State Management Pattern**
```typescript
// Use local state for component-specific state
const [localState, setLocalState] = useState(initialValue);

// Use React Query for server state
const { data, mutate } = useMutation({
  mutationFn: updateData,
});
```

### **Error Handling Pattern**
```typescript
// Always provide loading and error states
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;

// Use error boundaries for unexpected errors
<ErrorBoundary fallback={<ErrorFallback />}>
  <Component />
</ErrorBoundary>
```

### **Mobile-First Pattern**
```typescript
// Use Tailwind CSS responsive classes
<div className="p-4 md:p-6 lg:p-8">
  <button className="w-full md:w-auto px-4 py-2">
    Action
  </button>
</div>
```

## 📚 **Examples and References**

### **Component Examples**
- `examples/component_patterns_demo.tsx` - Basic component patterns
- `examples/hook_patterns_demo.tsx` - Custom hook patterns
- `examples/api_integration_demo.tsx` - API integration patterns
- `examples/error_handling_demo.tsx` - Error handling patterns

### **Pattern Documentation**
- `.agent-os/standards/tech-stack.md` - Technology stack details
- `.agent-os/standards/code-style.md` - Code style guidelines
- `.agent-os/standards/best-practices.md` - Best practices
- `.agent-os/product/` - Product requirements and roadmap

### **External Resources**
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)

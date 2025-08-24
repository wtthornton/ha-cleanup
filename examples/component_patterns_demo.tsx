/**
 * AI ASSISTANT CONTEXT: Component patterns demonstration for ha-cleanup
 * 
 * This file demonstrates the established React component patterns used in the ha-cleanup project.
 * Reference these patterns when implementing new components.
 * 
 * Key Patterns Used:
 * - React functional components with TypeScript
 * - Proper prop interfaces and type definitions
 * - Loading and error state handling
 * - Mobile-first responsive design with Tailwind CSS
 * - Accessibility features (ARIA labels, keyboard navigation)
 * 
 * Common Modifications:
 * - Styling changes with Tailwind classes
 * - Component prop adjustments
 * - Data integration modifications
 * 
 * Related Files:
 * - .agent-os/standards/context7-standards.md
 * - .agent-os/standards/tech-stack.md
 * - .agent-os/instructions/ai-development.md
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// ============================================================================
// Basic Component Pattern
// ============================================================================

interface BasicComponentProps {
  /** AI ASSISTANT CONTEXT: Component title for display */
  title: string;
  /** AI ASSISTANT CONTEXT: Optional subtitle for additional context */
  subtitle?: string;
  /** AI ASSISTANT CONTEXT: Callback function for user actions */
  onAction?: (data: any) => void;
}

export const BasicComponent: React.FC<BasicComponentProps> = ({ 
  title, 
  subtitle, 
  onAction 
}) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {subtitle && (
        <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
      )}
      {onAction && (
        <button
          onClick={() => onAction({ title, timestamp: new Date() })}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          aria-label={`Perform action for ${title}`}
        >
          Take Action
        </button>
      )}
    </div>
  );
};

// ============================================================================
// Data Fetching Component Pattern
// ============================================================================

interface DataComponentProps {
  /** AI ASSISTANT CONTEXT: Entity ID to fetch data for */
  entityId: string;
  /** AI ASSISTANT CONTEXT: Time range for data query */
  timeRange: string;
}

export const DataComponent: React.FC<DataComponentProps> = ({ 
  entityId, 
  timeRange 
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ha-data', entityId, timeRange],
    queryFn: () => fetchHomeAssistantData(entityId, timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
        <p className="mt-1 text-sm text-red-700">
          Unable to load data for {entityId}. Please try again.
        </p>
        <details className="mt-2">
          <summary className="text-sm text-red-600 cursor-pointer">
            Error details
          </summary>
          <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded">
            {error.message}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">
        Data for {entityId}
      </h3>
      <div className="mt-2 text-sm text-gray-600">
        Time Range: {timeRange}
      </div>
      {data && (
        <div className="mt-3">
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Form Component Pattern
// ============================================================================

interface FormComponentProps {
  /** AI ASSISTANT CONTEXT: Initial form values */
  initialValues?: Record<string, any>;
  /** AI ASSISTANT CONTEXT: Callback for form submission */
  onSubmit: (values: Record<string, any>) => void;
  /** AI ASSISTANT CONTEXT: Callback for form cancellation */
  onCancel?: () => void;
}

export const FormComponent: React.FC<FormComponentProps> = ({ 
  initialValues = {}, 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
          aria-describedby="name-help"
        />
        <p id="name-help" className="mt-1 text-sm text-gray-500">
          Enter the name for this item
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

// ============================================================================
// List Component Pattern
// ============================================================================

interface ListItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
}

interface ListComponentProps {
  /** AI ASSISTANT CONTEXT: Array of items to display */
  items: ListItem[];
  /** AI ASSISTANT CONTEXT: Callback when item is selected */
  onItemSelect?: (item: ListItem) => void;
  /** AI ASSISTANT CONTEXT: Callback when item is deleted */
  onItemDelete?: (itemId: string) => void;
  /** AI ASSISTANT CONTEXT: Whether to show empty state */
  showEmptyState?: boolean;
}

export const ListComponent: React.FC<ListComponentProps> = ({ 
  items, 
  onItemSelect, 
  onItemDelete, 
  showEmptyState = true 
}) => {
  if (items.length === 0 && showEmptyState) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900">No items found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new item.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <button
                onClick={() => onItemSelect?.(item)}
                className="text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              >
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {item.timestamp.toLocaleDateString()}
                </p>
              </button>
            </div>
            {onItemDelete && (
              <button
                onClick={() => onItemDelete(item.id)}
                className="ml-3 p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                aria-label={`Delete ${item.title}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// Mock Data and Helper Functions
// ============================================================================

// Mock function for demonstration - replace with actual implementation
const fetchHomeAssistantData = async (entityId: string, timeRange: string) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock data
  return {
    entityId,
    timeRange,
    data: [
      { timestamp: new Date(), value: Math.random() * 100 },
      { timestamp: new Date(Date.now() - 60000), value: Math.random() * 100 },
      { timestamp: new Date(Date.now() - 120000), value: Math.random() * 100 },
    ]
  };
};

// ============================================================================
// Usage Examples
// ============================================================================

export const ComponentPatternsDemo: React.FC = () => {
  const mockItems: ListItem[] = [
    {
      id: '1',
      title: 'Temperature Sensor',
      description: 'Living room temperature readings',
      timestamp: new Date(),
    },
    {
      id: '2',
      title: 'Motion Detector',
      description: 'Front door motion detection',
      timestamp: new Date(Date.now() - 3600000),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Component Patterns Demo
        </h1>
        <p className="text-gray-600">
          This demonstrates the established React component patterns for ha-cleanup.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BasicComponent
          title="Basic Component"
          subtitle="A simple component with optional action"
          onAction={(data) => console.log('Action triggered:', data)}
        />

        <DataComponent
          entityId="sensor.living_room_temperature"
          timeRange="1h"
        />
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Form Component</h2>
        <FormComponent
          initialValues={{ name: 'Example Item' }}
          onSubmit={(values) => console.log('Form submitted:', values)}
          onCancel={() => console.log('Form cancelled')}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">List Component</h2>
        <ListComponent
          items={mockItems}
          onItemSelect={(item) => console.log('Item selected:', item)}
          onItemDelete={(itemId) => console.log('Item deleted:', itemId)}
        />
      </div>
    </div>
  );
};

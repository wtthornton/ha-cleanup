/**
 * AI ASSISTANT CONTEXT: Application-level type definitions for ha-cleanup.
 * Includes UI component types, application state, and configuration types.
 */

import React from 'react'
import { QueryOptions, TimeRange } from './influxdb'

// Re-export commonly used types
export type { TimeRange }

// Application configuration
export interface AppConfig {
  influxdb: {
    url: string
    token: string
    org: string
    bucket: string
  }
  ui: {
    theme: 'light' | 'dark' | 'auto'
    refreshInterval: number
    eventsPerPage: number
    autoRefresh: boolean
  }
  features: {
    mockDataMode: boolean
    realTimeUpdates: boolean
    notifications: boolean
  }
}

// Navigation item
export interface NavigationItem {
  name: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: number
}

// Page metadata
export interface PageMeta {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

// Loading states for different components
export interface LoadingState {
  dashboard: boolean
  events: boolean
  analytics: boolean
  settings: boolean
}

// Error states
export interface ErrorState {
  message: string
  code?: string
  timestamp: Date
  component?: string
}

// Application state
export interface AppState {
  config: AppConfig
  loading: LoadingState
  error: ErrorState | null
  connectionStatus: {
    influxdb: 'connected' | 'disconnected' | 'connecting' | 'error'
    lastCheck: Date | null
  }
}

// Dashboard card data
export interface DashboardCard {
  id: string
  title: string
  value: string | number
  unit?: string
  change?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    period: string
  }
  icon?: string
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}

// Chart data structure
export interface ChartData {
  timestamp: string
  value: number
  label?: string
  category?: string
}

// Chart configuration
export interface ChartConfig {
  type: 'line' | 'bar' | 'area' | 'pie'
  title: string
  xAxis: string
  yAxis: string
  data: ChartData[]
  options?: {
    responsive: boolean
    maintainAspectRatio: boolean
    plugins?: Record<string, any>
  }
}

// Event filter options for UI
export interface EventFilters extends QueryOptions {
  timeRange: TimeRange
  searchTerm?: string
  eventTypes?: string[]
  sortBy?: 'timestamp' | 'entity_id' | 'domain'
  sortOrder?: 'asc' | 'desc'
}

// Event display item for UI
export interface EventDisplayItem {
  id: string
  timestamp: Date
  entity: {
    id: string
    friendlyName: string
    domain: string
    deviceClass?: string
  }
  event: {
    type: string
    from?: string
    to?: string
    description: string
  }
  icon?: string
  category: 'automation' | 'sensor' | 'security' | 'climate' | 'other'
}

// Notification types
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  action: () => void
  style?: 'primary' | 'secondary' | 'destructive'
}

// Analytics summary
export interface AnalyticsSummary {
  period: string
  metrics: {
    totalEvents: number
    activeDevices: number
    energyUsage: {
      current: number
      previous: number
      unit: string
    }
    systemHealth: {
      score: number
      issues: string[]
      recommendations: string[]
    }
  }
  trends: {
    events: ChartData[]
    energy: ChartData[]
    devices: ChartData[]
  }
}

// Device information
export interface DeviceInfo {
  entity_id: string
  friendly_name: string
  domain: string
  device_class?: string
  manufacturer?: string
  model?: string
  location?: string
  last_seen: Date
  state: string
  attributes?: Record<string, any>
}

// Search result
export interface SearchResult {
  type: 'device' | 'event' | 'automation'
  id: string
  title: string
  description: string
  timestamp?: Date
  relevance: number
}

// Settings sections
export interface SettingsSection {
  id: string
  title: string
  description: string
  fields: SettingsField[]
}

export interface SettingsField {
  id: string
  type: 'text' | 'password' | 'number' | 'boolean' | 'select' | 'multiselect'
  label: string
  description?: string
  value: any
  required?: boolean
  options?: { value: any; label: string }[]
  validation?: (value: any) => string | null
}

// Export/Import data types
export interface ExportConfig {
  format: 'json' | 'csv' | 'xlsx'
  timeRange: TimeRange
  measurements: string[]
  filters?: QueryOptions
  includeMetadata: boolean
}

export interface ImportResult {
  success: boolean
  recordsProcessed: number
  errors: string[]
  warnings: string[]
}

// Mobile-specific types
export interface TouchGesture {
  type: 'tap' | 'swipe' | 'pinch' | 'long-press'
  direction?: 'left' | 'right' | 'up' | 'down'
  target: string
}

export interface MobileViewport {
  width: number
  height: number
  orientation: 'portrait' | 'landscape'
  safeArea: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

// Performance monitoring
export interface PerformanceMetric {
  name: string
  duration: number
  timestamp: Date
  metadata?: Record<string, any>
}

// Cache management
export interface CacheConfig {
  ttl: number
  maxSize: number
  strategy: 'lru' | 'fifo' | 'lfu'
}

// API response wrapper
export interface ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
  error?: {
    code: string
    message: string
    details?: any
  }
  metadata?: {
    timestamp: Date
    requestId: string
    version: string
  }
}
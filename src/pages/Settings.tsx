import { useState } from 'react'

/**
 * AI ASSISTANT CONTEXT: Settings page component for application configuration.
 * Features mobile-first form design with data source settings and user preferences.
 * 
 * Key features:
 * - Mobile-friendly form layouts with proper touch targets
 * - InfluxDB connection settings
 * - Mock data mode toggle for development
 * - User preference management
 * - Responsive settings sections
 */
function Settings() {
  const [mockDataMode, setMockDataMode] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState('30')

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
          Settings
        </h2>
        <p className='mt-2 text-gray-600'>
          Configure your HA Cleanup application preferences and data sources
        </p>
      </div>

      {/* Data Source Settings */}
      <div className='card'>
        <div className='card-header'>
          <h3 className='text-lg font-medium text-gray-900'>Data Source</h3>
        </div>
        
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex-1'>
              <h4 className='text-sm font-medium text-gray-900'>Mock Data Mode</h4>
              <p className='text-sm text-gray-600'>
                Use sample data for development and testing
              </p>
            </div>
            <div className='ml-4'>
              <button
                type='button'
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${
                  mockDataMode ? 'bg-primary-600' : 'bg-gray-200'
                }`}
                role='switch'
                aria-checked={mockDataMode}
                onClick={() => setMockDataMode(!mockDataMode)}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    mockDataMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {!mockDataMode && (
            <div className='space-y-4 border-t border-gray-200 pt-4'>
              <div>
                <label htmlFor='influxdb-url' className='form-label'>
                  InfluxDB URL
                </label>
                <input
                  id='influxdb-url'
                  type='url'
                  className='form-input'
                  placeholder='http://ha-ingestor:8086'
                  defaultValue='http://ha-ingestor:8086'
                />
              </div>

              <div>
                <label htmlFor='influxdb-token' className='form-label'>
                  InfluxDB Token
                </label>
                <input
                  id='influxdb-token'
                  type='password'
                  className='form-input'
                  placeholder='Your InfluxDB access token'
                />
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div>
                  <label htmlFor='influxdb-org' className='form-label'>
                    Organization
                  </label>
                  <input
                    id='influxdb-org'
                    type='text'
                    className='form-input'
                    placeholder='your-org'
                  />
                </div>

                <div>
                  <label htmlFor='influxdb-bucket' className='form-label'>
                    Bucket
                  </label>
                  <input
                    id='influxdb-bucket'
                    type='text'
                    className='form-input'
                    placeholder='home_assistant'
                    defaultValue='home_assistant'
                  />
                </div>
              </div>

              <button className='btn-primary'>
                Test Connection
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Display Settings */}
      <div className='card'>
        <div className='card-header'>
          <h3 className='text-lg font-medium text-gray-900'>Display Preferences</h3>
        </div>
        
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex-1'>
              <h4 className='text-sm font-medium text-gray-900'>Auto Refresh</h4>
              <p className='text-sm text-gray-600'>
                Automatically refresh data at regular intervals
              </p>
            </div>
            <div className='ml-4'>
              <button
                type='button'
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${
                  autoRefresh ? 'bg-primary-600' : 'bg-gray-200'
                }`}
                role='switch'
                aria-checked={autoRefresh}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    autoRefresh ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {autoRefresh && (
            <div>
              <label htmlFor='refresh-interval' className='form-label'>
                Refresh Interval (seconds)
              </label>
              <select
                id='refresh-interval'
                className='form-input'
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
              >
                <option value='10'>10 seconds</option>
                <option value='30'>30 seconds</option>
                <option value='60'>1 minute</option>
                <option value='300'>5 minutes</option>
                <option value='600'>10 minutes</option>
              </select>
            </div>
          )}

          <div>
            <label htmlFor='events-per-page' className='form-label'>
              Events per page
            </label>
            <select id='events-per-page' className='form-input'>
              <option value='25'>25</option>
              <option value='50'>50</option>
              <option value='100'>100</option>
              <option value='200'>200</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className='card'>
        <div className='card-header'>
          <h3 className='text-lg font-medium text-gray-900'>Notifications</h3>
        </div>
        
        <div className='space-y-4'>
          <div className='flex items-start'>
            <div className='flex h-6 items-center'>
              <input
                id='notify-anomalies'
                type='checkbox'
                className='h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600'
                defaultChecked
              />
            </div>
            <div className='ml-3'>
              <label htmlFor='notify-anomalies' className='text-sm font-medium text-gray-900'>
                Anomaly Detection Alerts
              </label>
              <p className='text-sm text-gray-600'>
                Get notified when unusual patterns are detected
              </p>
            </div>
          </div>

          <div className='flex items-start'>
            <div className='flex h-6 items-center'>
              <input
                id='notify-suggestions'
                type='checkbox'
                className='h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600'
                defaultChecked
              />
            </div>
            <div className='ml-3'>
              <label htmlFor='notify-suggestions' className='text-sm font-medium text-gray-900'>
                New Suggestions
              </label>
              <p className='text-sm text-gray-600'>
                Get notified when new optimization suggestions are available
              </p>
            </div>
          </div>

          <div className='flex items-start'>
            <div className='flex h-6 items-center'>
              <input
                id='notify-issues'
                type='checkbox'
                className='h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600'
                defaultChecked
              />
            </div>
            <div className='ml-3'>
              <label htmlFor='notify-issues' className='text-sm font-medium text-gray-900'>
                System Issues
              </label>
              <p className='text-sm text-gray-600'>
                Get notified when potential system issues are identified
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0'>
        <button className='btn-primary flex-1'>
          Save Settings
        </button>
        <button className='btn-secondary flex-1'>
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}

export default Settings
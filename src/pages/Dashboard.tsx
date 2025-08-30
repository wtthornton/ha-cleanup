/**
 * AI ASSISTANT CONTEXT: Dashboard page component that provides the main overview
 * of Home Assistant data analysis. Features mobile-first design with key metrics
 * and recent activity summaries.
 * 
 * Key features:
 * - Mobile-friendly card layout
 * - Overview metrics and statistics
 * - Recent suggestions and insights
 * - Quick action buttons for common tasks
 */
function Dashboard() {
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
          Dashboard
        </h2>
        <p className='mt-2 text-gray-600'>
          Overview of your Home Assistant data and insights
        </p>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='card'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='h-8 w-8 rounded bg-blue-100 flex items-center justify-center'>
                <span className='text-sm font-medium text-blue-600'>📊</span>
              </div>
            </div>
            <div className='ml-4'>
              <h3 className='text-sm font-medium text-gray-900'>Total Events</h3>
              <p className='text-2xl font-bold text-gray-900'>12,485</p>
            </div>
          </div>
        </div>

        <div className='card'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='h-8 w-8 rounded bg-green-100 flex items-center justify-center'>
                <span className='text-sm font-medium text-green-600'>✅</span>
              </div>
            </div>
            <div className='ml-4'>
              <h3 className='text-sm font-medium text-gray-900'>Active Devices</h3>
              <p className='text-2xl font-bold text-gray-900'>23</p>
            </div>
          </div>
        </div>

        <div className='card'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='h-8 w-8 rounded bg-yellow-100 flex items-center justify-center'>
                <span className='text-sm font-medium text-yellow-600'>⚠️</span>
              </div>
            </div>
            <div className='ml-4'>
              <h3 className='text-sm font-medium text-gray-900'>Suggestions</h3>
              <p className='text-2xl font-bold text-gray-900'>5</p>
            </div>
          </div>
        </div>

        <div className='card'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='h-8 w-8 rounded bg-red-100 flex items-center justify-center'>
                <span className='text-sm font-medium text-red-600'>🔥</span>
              </div>
            </div>
            <div className='ml-4'>
              <h3 className='text-sm font-medium text-gray-900'>Issues</h3>
              <p className='text-2xl font-bold text-gray-900'>2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className='card'>
        <div className='card-header'>
          <h3 className='text-lg font-medium text-gray-900'>Recent Activity</h3>
        </div>
        <div className='space-y-3'>
          <div className='flex items-center justify-between py-2'>
            <div className='flex items-center space-x-3'>
              <div className='h-2 w-2 rounded-full bg-green-400'></div>
              <span className='text-sm text-gray-900'>Kitchen Light turned on</span>
            </div>
            <span className='text-xs text-gray-500'>2 min ago</span>
          </div>
          <div className='flex items-center justify-between py-2'>
            <div className='flex items-center space-x-3'>
              <div className='h-2 w-2 rounded-full bg-blue-400'></div>
              <span className='text-sm text-gray-900'>Temperature sensor updated</span>
            </div>
            <span className='text-xs text-gray-500'>5 min ago</span>
          </div>
          <div className='flex items-center justify-between py-2'>
            <div className='flex items-center space-x-3'>
              <div className='h-2 w-2 rounded-full bg-yellow-400'></div>
              <span className='text-sm text-gray-900'>Motion detected in hallway</span>
            </div>
            <span className='text-xs text-gray-500'>8 min ago</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='card'>
        <div className='card-header'>
          <h3 className='text-lg font-medium text-gray-900'>Quick Actions</h3>
        </div>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <button className='btn-primary w-full'>
            View Recent Events
          </button>
          <button className='btn-secondary w-full'>
            Generate Report
          </button>
          <button className='btn-outline w-full'>
            Review Suggestions
          </button>
          <button className='btn-outline w-full'>
            System Analysis
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
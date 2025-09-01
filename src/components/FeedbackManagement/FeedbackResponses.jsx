import React from "react";

const FilterCard = ({ title, children, icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center mb-4">
      <div className={`flex-shrink-0 w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
      <div className="ml-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
    </div>
    {children}
  </div>
);

const FeedbackResponses = () => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-teal-200 dark:border-teal-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Feedback Responses</h2>
        <p className="text-gray-600 dark:text-gray-400">Monitor and analyze feedback responses with advanced filtering and analytics</p>
      </div>

      {/* Response Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Responses</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">1,247</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">This Week</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">89</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Rating</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">4.2/5</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Response Rate</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">87.3%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FilterCard
          title="Date Range"
          icon={
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          color="bg-blue-100 dark:bg-blue-900/30"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">From</span>
              <input type="date" className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">To</span>
              <input type="date" className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Preset</span>
              <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>This year</option>
              </select>
            </div>
          </div>
        </FilterCard>

        <FilterCard
          title="Role & Cohort"
          icon={
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          color="bg-green-100 dark:bg-green-900/30"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Role</span>
              <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>All Roles</option>
                <option>Student</option>
                <option>Faculty</option>
                <option>Staff</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Department</span>
              <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>All Departments</option>
                <option>Computer Science</option>
                <option>Engineering</option>
                <option>Business</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Year</span>
              <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>All Years</option>
                <option>2024</option>
                <option>2023</option>
                <option>2022</option>
              </select>
            </div>
          </div>
        </FilterCard>

        <FilterCard
          title="Response Status"
          icon={
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="bg-purple-100 dark:bg-purple-900/30"
        >
          <div className="space-y-3">
            <label className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
              <input type="checkbox" className="mr-3 text-blue-600 dark:text-blue-400" defaultChecked />
              <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
            </label>
            <label className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
              <input type="checkbox" className="mr-3 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">In Progress</span>
            </label>
            <label className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
              <input type="checkbox" className="mr-3 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Not Started</span>
            </label>
          </div>
        </FilterCard>
      </div>

      {/* Responses Table Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Response Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Filtered responses will appear here</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </div>
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </div>
            </button>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No responses to display</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Use the filters above to view specific feedback responses or adjust your search criteria.</p>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200">
            View All Responses
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackResponses;



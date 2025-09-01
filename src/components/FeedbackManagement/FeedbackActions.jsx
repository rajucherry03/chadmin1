import React from "react";

const ActionCard = ({ title, description, icon, color, status, priority, assignee, dueDate }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center">
        <div className={`flex-shrink-0 w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <div className="flex flex-col items-end space-y-2">
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
          status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
          status === 'in-progress' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
          'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
        }`}>
          {status === 'completed' ? 'Completed' : status === 'in-progress' ? 'In Progress' : 'Pending'}
        </span>
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
          priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' :
          priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
          'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
        }`}>
          {priority === 'high' ? 'High' : priority === 'medium' ? 'Medium' : 'Low'}
        </span>
      </div>
    </div>
    
    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
      <div className="flex items-center">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        {assignee}
      </div>
      <div className="flex items-center">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {dueDate}
      </div>
    </div>
  </div>
);

const FeedbackActions = () => {
  const actionItems = [
    {
      title: "Improve Course Content",
      description: "Based on low ratings in Course Evaluation form",
      icon: (
        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: "bg-blue-100 dark:bg-blue-900/30",
      status: "in-progress",
      priority: "high",
      assignee: "Dr. Smith",
      dueDate: "Dec 15, 2024"
    },
    {
      title: "Enhance Faculty Support",
      description: "Address concerns from Faculty Feedback survey",
      icon: (
        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "bg-green-100 dark:bg-green-900/30",
      status: "pending",
      priority: "medium",
      assignee: "HR Department",
      dueDate: "Dec 20, 2024"
    },
    {
      title: "Update Student Services",
      description: "Implement improvements from Student Services feedback",
      icon: (
        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: "bg-purple-100 dark:bg-purple-900/30",
      status: "completed",
      priority: "low",
      assignee: "Student Affairs",
      dueDate: "Dec 10, 2024"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Feedback Action Items</h2>
        <p className="text-gray-600 dark:text-gray-400">Track and manage action items from low-rated questions or flagged comments</p>
      </div>

      {/* Action Items Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Actions</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">2</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">1</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">1</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Items List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Action Items</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage feedback-driven improvements and tasks</p>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Action Item
            </div>
          </button>
        </div>

        <div className="space-y-4">
          {actionItems.map((item, index) => (
            <ActionCard key={index} {...item} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 group">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Create Report</span>
          </button>

          <button className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 group">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Assign Task</span>
          </button>

          <button className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 group">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Set Deadline</span>
          </button>

          <button className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 group">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackActions;



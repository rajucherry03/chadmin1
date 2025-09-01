import React from "react";

const FeatureCard = ({ title, description, icon, color, features }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-200">
    <div className="flex items-center mb-4">
      <div className={`flex-shrink-0 w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
    <div className="space-y-2">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {feature}
        </div>
      ))}
    </div>
  </div>
);

const FeedbackDistribute = () => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Distribute Feedback Forms</h2>
        <p className="text-gray-600 dark:text-gray-400">Reach your target audience through multiple channels and distribution methods</p>
      </div>

      {/* Distribution Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FeatureCard
          title="Distribution Channels"
          description="Multiple ways to reach your audience"
          icon={
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
          color="bg-blue-100 dark:bg-blue-900/30"
          features={[
            "Email campaigns with tracking",
            "SMS notifications",
            "In-app notifications",
            "WhatsApp Business API",
            "QR code generation",
            "Direct link sharing"
          ]}
        />

        <FeatureCard
          title="Audience Targeting"
          description="Precise targeting with advanced filters"
          icon={
            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          color="bg-purple-100 dark:bg-purple-900/30"
          features={[
            "Role-based targeting",
            "Department filters",
            "Cohort selection",
            "Custom audience lists",
            "Geographic targeting",
            "Behavioral segmentation"
          ]}
        />

        <FeatureCard
          title="Scheduling & Automation"
          description="Smart scheduling and reminder systems"
          icon={
            <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="bg-orange-100 dark:bg-orange-900/30"
          features={[
            "Start/end date selection",
            "Time zone handling",
            "Automated reminders",
            "Follow-up sequences",
            "Response tracking",
            "Performance analytics"
          ]}
        />
      </div>

      {/* Quick Distribution Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 group">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Email Campaign</span>
          </button>

          <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 group">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">SMS Notification</span>
          </button>

          <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 group">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">QR Code</span>
          </button>

          <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 group">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Direct Link</span>
          </button>
        </div>
      </div>

      {/* Distribution Settings */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribution Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Timing & Frequency</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-600 dark:text-gray-400">Initial Send</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Immediate</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-600 dark:text-gray-400">Reminder 1</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">3 days later</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-600 dark:text-gray-400">Reminder 2</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">7 days later</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Response Tracking</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-600 dark:text-gray-400">Open Tracking</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Enabled</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-600 dark:text-gray-400">Click Tracking</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Enabled</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-600 dark:text-gray-400">Response Analytics</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Enabled</span>
              </div>
        </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDistribute;



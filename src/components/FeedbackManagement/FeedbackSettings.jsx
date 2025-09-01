import React from "react";

const SettingCard = ({ title, description, icon, color, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center mb-4">
      <div className={`flex-shrink-0 w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
      <div className="ml-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

const FeedbackSettings = () => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-violet-200 dark:border-violet-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Feedback Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">Configure privacy, moderation, and system preferences</p>
      </div>

      {/* Privacy & Anonymity */}
      <SettingCard
        title="Privacy & Anonymity"
        description="Configure anonymous mode, consent, and PII handling"
        icon={
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        }
        color="bg-blue-100 dark:bg-blue-900/30"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Anonymous Mode</span>
            <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Data Retention</span>
            <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
              <option>1 year</option>
              <option>2 years</option>
              <option>5 years</option>
              <option>Indefinite</option>
            </select>
          </div>
        </div>
      </SettingCard>

      {/* Moderation */}
      <SettingCard
        title="Moderation"
        description="Auto-flagging rules and reviewer workflow"
        icon={
          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        color="bg-green-100 dark:bg-green-900/30"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Auto-flagging</span>
            <input type="checkbox" className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Review Required</span>
            <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
              <option>All responses</option>
              <option>Flagged only</option>
              <option>Low ratings</option>
            </select>
          </div>
        </div>
      </SettingCard>

      {/* System Preferences */}
      <SettingCard
        title="System Preferences"
        description="Notification and automation settings"
        icon={
          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
        color="bg-purple-100 dark:bg-purple-900/30"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Email Notifications</span>
            <input type="checkbox" className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" defaultChecked />
      </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Auto-reminders</span>
            <input type="checkbox" className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" defaultChecked />
      </div>
        </div>
      </SettingCard>
    </div>
  );
};

export default FeedbackSettings;



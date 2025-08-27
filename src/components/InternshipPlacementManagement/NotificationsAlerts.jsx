import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faEnvelope, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const NotificationsAlerts = ({ userRole, notifications, loading, error }) => {
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications & Alerts</h1>
          <p className="text-gray-600">Manage system notifications and alerts</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Notifications</p>
              <p className="text-2xl font-bold text-blue-600">{notifications.length}</p>
            </div>
            <FontAwesomeIcon icon={faBell} className="text-blue-600 text-xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-yellow-600">
                {notifications.filter(n => !n.read).length}
              </p>
            </div>
            <FontAwesomeIcon icon={faEnvelope} className="text-yellow-600 text-xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Important</p>
              <p className="text-2xl font-bold text-red-600">
                {notifications.filter(n => n.priority === 'high').length}
              </p>
            </div>
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Read</p>
              <p className="text-2xl font-bold text-green-600">
                {notifications.filter(n => n.read).length}
              </p>
            </div>
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
        <div className="text-center py-8">
          <FontAwesomeIcon icon={faBell} className="text-gray-400 text-3xl mb-2" />
          <p className="text-gray-500">Notification settings coming soon</p>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500">No notifications to display</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsAlerts;

import React, { useState, useEffect } from 'react';
import { FaCog, FaBell, FaEnvelope, FaSms, FaSave, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { collection, doc, updateDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const EventSettings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      reminderDays: 1,
      autoApproval: false,
      requireApproval: true
    },
    registration: {
      allowWaitlist: true,
      maxWaitlistSize: 20,
      autoPromoteWaitlist: true,
      requirePaymentConfirmation: false,
      allowCancellation: true,
      cancellationDeadline: 24 // hours before event
    },
    display: {
      showPastEvents: false,
      showDraftEvents: false,
      eventsPerPage: 10,
      defaultView: 'calendar',
      enableQRCode: true,
      enableFeedback: true
    },
    system: {
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12',
      currency: 'INR',
      language: 'en'
    }
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'eventManagement'));
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data());
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await setDoc(doc(db, 'settings', 'eventManagement'), {
        ...settings,
        updatedAt: serverTimestamp()
      });

      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      setSettings({
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          reminderDays: 1,
          autoApproval: false,
          requireApproval: true
        },
        registration: {
          allowWaitlist: true,
          maxWaitlistSize: 20,
          autoPromoteWaitlist: true,
          requirePaymentConfirmation: false,
          allowCancellation: true,
          cancellationDeadline: 24
        },
        display: {
          showPastEvents: false,
          showDraftEvents: false,
          eventsPerPage: 10,
          defaultView: 'calendar',
          enableQRCode: true,
          enableFeedback: true
        },
        system: {
          timezone: 'Asia/Kolkata',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '12',
          currency: 'INR',
          language: 'en'
        }
      });
      setMessage({ type: 'success', text: 'Settings reset to defaults' });
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Event Management Settings</h2>
        <p className="text-gray-600">Configure system preferences and notification settings</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <FaCheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <FaTimes className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <FaBell className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Email Notifications</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Send event updates via email</p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.smsNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">SMS Notifications</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Send event updates via SMS</p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.pushNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Push Notifications</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Send browser push notifications</p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.autoApproval}
                    onChange={(e) => handleSettingChange('notifications', 'autoApproval', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto-approve Events</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Automatically approve new events</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder Days Before Event
                </label>
                <input
                  type="number"
                  value={settings.notifications.reminderDays}
                  onChange={(e) => handleSettingChange('notifications', 'reminderDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="7"
                />
                <p className="text-xs text-gray-500 mt-1">Days before event to send reminders</p>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Settings */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <FaEnvelope className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Registration Settings</h3>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.registration.allowWaitlist}
                    onChange={(e) => handleSettingChange('registration', 'allowWaitlist', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Allow Waitlist</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Enable waitlist for full events</p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.registration.autoPromoteWaitlist}
                    onChange={(e) => handleSettingChange('registration', 'autoPromoteWaitlist', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto-promote Waitlist</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Automatically promote waitlist when spots open</p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.registration.allowCancellation}
                    onChange={(e) => handleSettingChange('registration', 'allowCancellation', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Allow Cancellation</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Allow participants to cancel registrations</p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.registration.requirePaymentConfirmation}
                    onChange={(e) => handleSettingChange('registration', 'requirePaymentConfirmation', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Require Payment Confirmation</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Require payment confirmation for paid events</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Waitlist Size
                </label>
                <input
                  type="number"
                  value={settings.registration.maxWaitlistSize}
                  onChange={(e) => handleSettingChange('registration', 'maxWaitlistSize', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum number of waitlist entries per event</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Deadline (hours)
                </label>
                <input
                  type="number"
                  value={settings.registration.cancellationDeadline}
                  onChange={(e) => handleSettingChange('registration', 'cancellationDeadline', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="168"
                />
                <p className="text-xs text-gray-500 mt-1">Hours before event when cancellation is allowed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <FaCog className="h-5 w-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Display Settings</h3>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.display.showPastEvents}
                    onChange={(e) => handleSettingChange('display', 'showPastEvents', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show Past Events</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Display completed events in calendar</p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.display.showDraftEvents}
                    onChange={(e) => handleSettingChange('display', 'showDraftEvents', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show Draft Events</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Display draft events to organizers</p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.display.enableQRCode}
                    onChange={(e) => handleSettingChange('display', 'enableQRCode', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable QR Codes</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Generate QR codes for attendance</p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.display.enableFeedback}
                    onChange={(e) => handleSettingChange('display', 'enableFeedback', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Feedback</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Allow participants to provide feedback</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Events Per Page
                </label>
                <select
                  value={settings.display.eventsPerPage}
                  onChange={(e) => handleSettingChange('display', 'eventsPerPage', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5 events</option>
                  <option value={10}>10 events</option>
                  <option value={20}>20 events</option>
                  <option value={50}>50 events</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default View
                </label>
                <select
                  value={settings.display.defaultView}
                  onChange={(e) => handleSettingChange('display', 'defaultView', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="calendar">Calendar</option>
                  <option value="list">List</option>
                  <option value="grid">Grid</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <FaCog className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={settings.system.timezone}
                  onChange={(e) => handleSettingChange('system', 'timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Format
                </label>
                <select
                  value={settings.system.dateFormat}
                  onChange={(e) => handleSettingChange('system', 'dateFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Format
                </label>
                <select
                  value={settings.system.timeFormat}
                  onChange={(e) => handleSettingChange('system', 'timeFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="12">12-hour</option>
                  <option value="24">24-hour</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={settings.system.currency}
                  onChange={(e) => handleSettingChange('system', 'currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={resetToDefaults}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
          >
            <FaSave className="mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventSettings;

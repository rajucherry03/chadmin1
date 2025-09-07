// TODO: This component needs Django API integration - Firebase imports removed
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope, faUsers, faClock, faCheckCircle,
  faExclamationTriangle, faTimes, faPlus, faTrash, faEdit
} from '@fortawesome/free-solid-svg-icons';
import {
  collection, addDoc, getDocs, query, where, orderBy, onSnapshot,
  serverTimestamp, updateDoc, deleteDoc, doc
} from 'firebase/firestore';

const Notifications = () => {
  const [students, setStudents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filters, setFilters] = useState({
    year: '',
    section: '',
    department: ''
  });

  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    type: 'general',
    priority: 'normal',
    scheduledFor: '',
    recipients: 'all' // 'all', 'selected', 'filtered'
  });

  // Fetch students and notifications
  useEffect(() => {
    const unsubscribeStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      const studentsData = [];
      snapshot.forEach((doc) => {
        studentsData.push({ id: doc.id, ...doc.data() });
      });
      setStudents(studentsData);
    });

    const unsubscribeNotifications = onSnapshot(
      query(collection(db, 'notifications'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const notificationsData = [];
        snapshot.forEach((doc) => {
          notificationsData.push({ id: doc.id, ...doc.data() });
        });
        setNotifications(notificationsData);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeStudents();
      unsubscribeNotifications();
    };
  }, []);

  // Filter students based on criteria
  const getFilteredStudents = () => {
    let filtered = students;

    if (filters.year) {
      filtered = filtered.filter(student => student.year === filters.year);
    }
    if (filters.section) {
      filtered = filtered.filter(student => student.section === filters.section);
    }
    if (filters.department) {
      filtered = filtered.filter(student => student.department === filters.department);
    }

    return filtered;
  };

  // Get recipients based on form selection
  const getRecipients = () => {
    switch (formData.recipients) {
      case 'all':
        return students;
      case 'selected':
        return students.filter(student => selectedStudents.includes(student.id));
      case 'filtered':
        return getFilteredStudents();
      default:
        return [];
    }
  };

  // Send notification
  const sendNotification = async () => {
    if (!formData.subject || !formData.message) {
      alert('Please fill in subject and message');
      return;
    }

    const recipients = getRecipients();
    if (recipients.length === 0) {
      alert('No recipients selected');
      return;
    }

    try {
      const notificationData = {
        subject: formData.subject,
        message: formData.message,
        type: formData.type,
        priority: formData.priority,
        recipients: recipients.map(s => s.id),
        recipientCount: recipients.length,
        status: 'sent',
        scheduledFor: formData.scheduledFor || null,
        createdAt: serverTimestamp(),
        sentAt: serverTimestamp()
      };

      await addDoc(collection(db, 'notifications'), notificationData);
      
      // Reset form
      setFormData({
        subject: '',
        message: '',
        type: 'general',
        priority: 'normal',
        scheduledFor: '',
        recipients: 'all'
      });
      
      setShowModal(false);
      alert(`Notification sent to ${recipients.length} students successfully!`);
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Error sending notification. Please try again.');
    }
  };

  // Schedule notification
  const scheduleNotification = async () => {
    if (!formData.subject || !formData.message || !formData.scheduledFor) {
      alert('Please fill in all required fields including scheduled time');
      return;
    }

    const recipients = getRecipients();
    if (recipients.length === 0) {
      alert('No recipients selected');
      return;
    }

    try {
      const notificationData = {
        subject: formData.subject,
        message: formData.message,
        type: formData.type,
        priority: formData.priority,
        recipients: recipients.map(s => s.id),
        recipientCount: recipients.length,
        status: 'scheduled',
        scheduledFor: new Date(formData.scheduledFor),
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'notifications'), notificationData);
      
      setFormData({
        subject: '',
        message: '',
        type: 'general',
        priority: 'normal',
        scheduledFor: '',
        recipients: 'all'
      });
      
      setShowModal(false);
      alert(`Notification scheduled for ${recipients.length} students!`);
    } catch (error) {
      console.error('Error scheduling notification:', error);
      alert('Error scheduling notification. Please try again.');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await deleteDoc(doc(db, 'notifications', notificationId));
        alert('Notification deleted successfully!');
      } catch (error) {
        console.error('Error deleting notification:', error);
        alert('Error deleting notification. Please try again.');
      }
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-600">Send bulk notifications to students</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>New Notification</span>
          </button>
          <button
            onClick={() => {/* TODO: Import contacts */}}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faUsers} />
            <span>Import Contacts</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FontAwesomeIcon icon={faEnvelope} className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sent</p>
              <p className="text-2xl font-semibold text-gray-900">
                {notifications.filter(n => n.status === 'sent').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FontAwesomeIcon icon={faClock} className="text-yellow-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-semibold text-gray-900">
                {notifications.filter(n => n.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-semibold text-gray-900">
                {notifications.reduce((sum, n) => sum + (n.recipientCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {notifications.filter(n => n.status === 'failed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notifications.map((notification) => (
                <tr key={notification.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{notification.subject}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{notification.message}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(notification.priority)}`}>
                      {notification.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {notification.recipientCount || 0} students
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(notification.status)}`}>
                      {notification.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {notification.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {/* TODO: View details */}}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Notification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Send Notification</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter notification subject"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="general">General</option>
                      <option value="academic">Academic</option>
                      <option value="fee">Fee</option>
                      <option value="event">Event</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
                    <select
                      value={formData.recipients}
                      onChange={(e) => setFormData(prev => ({ ...prev, recipients: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Students</option>
                      <option value="selected">Selected Students</option>
                      <option value="filtered">Filtered Students</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter notification message"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule For (Optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  {formData.scheduledFor ? (
                    <button
                      type="button"
                      onClick={scheduleNotification}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    >
                      Schedule
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={sendNotification}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Send Now
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;

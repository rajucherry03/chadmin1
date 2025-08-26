import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaUser, FaPhone, FaEnvelope,
  FaMoneyBillWave, FaCheckCircle, FaTimes, FaEdit, FaTrash, FaDownload, FaPrint,
  FaShare, FaQrcode, FaCamera, FaFileAlt, FaStar, FaBookmark, FaArrowLeft,
  FaExclamationTriangle, FaInfoCircle, FaChartBar, FaListUl, FaCog
} from 'react-icons/fa';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const EventDetails = ({ event, onClose, onEdit, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (event) {
      generateEventQRCode();
    }
  }, [event]);

  const generateEventQRCode = async () => {
    try {
      const qrData = JSON.stringify({
        eventId: event.id,
        title: event.title,
        date: event.startDate,
        venue: event.venue
      });
      // For now, we'll use a placeholder QR code
      // In a real implementation, you would use a QR code library
      setQrCodeData('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkVSIDogV1lTSUdOIFFSPC90ZXh0Pjwvc3ZnPg==');
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'events', event.id), {
        status: newStatus,
        updatedAt: new Date()
      });
      setMessage({ type: 'success', text: `Event status updated to ${newStatus}` });
      onRefresh();
    } catch (error) {
      console.error('Error updating event status:', error);
      setMessage({ type: 'error', text: 'Failed to update event status' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'events', event.id));
        setMessage({ type: 'success', text: 'Event deleted successfully' });
        onClose();
      } catch (error) {
        console.error('Error deleting event:', error);
        setMessage({ type: 'error', text: 'Failed to delete event' });
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Academic': 'bg-blue-100 text-blue-800',
      'Cultural': 'bg-purple-100 text-purple-800',
      'Technical': 'bg-green-100 text-green-800',
      'Sports': 'bg-orange-100 text-orange-800',
      'Placement': 'bg-indigo-100 text-indigo-800',
      'Workshop': 'bg-teal-100 text-teal-800',
      'Seminar': 'bg-pink-100 text-pink-800',
      'Conference': 'bg-yellow-100 text-yellow-800',
      'Hackathon': 'bg-red-100 text-red-800',
      'Competition': 'bg-cyan-100 text-cyan-800',
      'Guest Lecture': 'bg-lime-100 text-lime-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Other'];
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaInfoCircle },
    { id: 'registrations', label: 'Registrations', icon: FaUsers },
    { id: 'resources', label: 'Resources', icon: FaCog },
    { id: 'attendance', label: 'Attendance', icon: FaCheckCircle },
    { id: 'feedback', label: 'Feedback', icon: FaStar },
    { id: 'analytics', label: 'Analytics', icon: FaChartBar }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Event Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(event.status)}`}>
                {event.status}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(event.category)}`}>
                {event.category}
              </span>
            </div>
            <p className="text-gray-600 text-lg mb-4">{event.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3">
                <FaCalendarAlt className="text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Date</p>
                  <p className="text-sm text-gray-600">
                    {new Date(event.startDate).toLocaleDateString()}
                    {event.endDate && event.endDate !== event.startDate && 
                      ` - ${new Date(event.endDate).toLocaleDateString()}`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaClock className="text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Time</p>
                  <p className="text-sm text-gray-600">{event.startTime} - {event.endTime}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaMapMarkerAlt className="text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Venue</p>
                  <p className="text-sm text-gray-600">{event.venue}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaUsers className="text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Participants</p>
                  <p className="text-sm text-gray-600">
                    {event.registrations?.length || 0}
                    {event.maxParticipants && ` / ${event.maxParticipants}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(event)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Edit Event"
            >
              <FaEdit className="h-5 w-5" />
            </button>
            <button
              onClick={handleDeleteEvent}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Delete Event"
            >
              <FaTrash className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Organizer Information */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <FaUser className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Organizer</p>
              <p className="text-sm text-gray-600">{event.organizerName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <FaEnvelope className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Email</p>
              <p className="text-sm text-gray-600">{event.organizerEmail}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <FaPhone className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Phone</p>
              <p className="text-sm text-gray-600">{event.organizerPhone}</p>
            </div>
          </div>
          {event.budget && (
            <div className="flex items-center space-x-3">
              <FaMoneyBillWave className="text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Budget</p>
                <p className="text-sm text-gray-600">₹{event.budget}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Event Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Additional Information */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
          <div className="space-y-4">
            {event.isPaid && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Ticket Price</span>
                <span className="text-sm text-gray-600">₹{event.ticketPrice}</span>
              </div>
            )}
            {event.facultyCoordinators?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Faculty Coordinators</p>
                <div className="space-y-1">
                  {event.facultyCoordinators.map((coordinator, index) => (
                    <p key={index} className="text-sm text-gray-600">{coordinator}</p>
                  ))}
                </div>
              </div>
            )}
            {event.studentVolunteers?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Student Volunteers</p>
                <div className="space-y-1">
                  {event.studentVolunteers.map((volunteer, index) => (
                    <p key={index} className="text-sm text-gray-600">{volunteer}</p>
                  ))}
                </div>
              </div>
            )}
            {event.equipment?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Required Equipment</p>
                <div className="flex flex-wrap gap-2">
                  {event.equipment.map((item, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Event QR Code</h3>
          <div className="flex flex-col items-center space-y-4">
            {qrCodeData ? (
              <img src={qrCodeData} alt="Event QR Code" className="w-48 h-48" />
            ) : (
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <FaQrcode className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Scan to view event details</p>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = qrCodeData;
                  link.download = `event-${event.id}-qr.png`;
                  link.click();
                }}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FaDownload className="mr-1" />
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Management */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Management</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Current Status:</span>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(event.status)}`}>
            {event.status}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleStatusChange('approved')}
              disabled={event.status === 'approved' || loading}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-medium hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaCheckCircle className="mr-1" />
              Approve
            </button>
            <button
              onClick={() => handleStatusChange('rejected')}
              disabled={event.status === 'rejected' || loading}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaTimes className="mr-1" />
              Reject
            </button>
            <button
              onClick={() => handleStatusChange('ongoing')}
              disabled={event.status === 'ongoing' || loading}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mark Ongoing
            </button>
            <button
              onClick={() => handleStatusChange('completed')}
              disabled={event.status === 'completed' || loading}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mark Completed
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRegistrations = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Registrations</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {event.registrations?.length || 0} registered
            </span>
            {event.maxParticipants && (
              <span className="text-sm text-gray-600">
                / {event.maxParticipants} max
              </span>
            )}
          </div>
        </div>
        
        {event.registrations?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {event.registrations.map((registration, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {registration.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(registration.registrationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        registration.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {registration.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No registrations yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Participants will appear here once they register for the event.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Equipment */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Required Equipment</h4>
            {event.equipment?.length > 0 ? (
              <div className="space-y-2">
                {event.equipment.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <FaCog className="text-gray-400" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No equipment requirements specified</p>
            )}
          </div>

          {/* Documents */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Documents</h4>
            {event.documents?.length > 0 ? (
              <div className="space-y-2">
                {event.documents.map((doc, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <FaFileAlt className="text-gray-400" />
                    <span className="text-sm text-gray-600">{doc.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No documents uploaded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAttendance = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Tracking</h3>
        {event.attendance?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-out Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {event.attendance.map((record, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.checkInTime ? new Date(record.checkInTime).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.checkOutTime ? new Date(record.checkOutTime).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        record.status === 'present' ? 'bg-green-100 text-green-800' :
                        record.status === 'absent' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <FaCheckCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
            <p className="mt-1 text-sm text-gray-500">
              Attendance will be tracked here once the event starts.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Feedback</h3>
        {event.feedback?.length > 0 ? (
          <div className="space-y-4">
            {event.feedback.map((feedback, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-gray-900">{feedback.name}</span>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`h-4 w-4 ${
                          i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{feedback.comment}</p>
                <p className="text-xs text-gray-500">
                  {new Date(feedback.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaStar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No feedback yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Participant feedback will appear here after the event.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Registration Stats */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaUsers className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Registrations</p>
              <p className="text-2xl font-semibold text-gray-900">
                {event.registrations?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaCheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {event.registrations?.length > 0 
                  ? Math.round((event.attendance?.filter(a => a.status === 'present').length || 0) / event.registrations.length * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaStar className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Rating</p>
              <p className="text-2xl font-semibold text-gray-900">
                {event.feedback?.length > 0 
                  ? (event.feedback.reduce((sum, f) => sum + f.rating, 0) / event.feedback.length).toFixed(1)
                  : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Event Status */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaInfoCircle className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Event Status</p>
              <p className="text-2xl font-semibold text-gray-900 capitalize">
                {event.status}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Trends</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <FaChartBar className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Charts will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'registrations':
        return renderRegistrations();
      case 'resources':
        return renderResources();
      case 'attendance':
        return renderAttendance();
      case 'feedback':
        return renderFeedback();
      case 'analytics':
        return renderAnalytics();
      default:
        return renderOverview();
    }
  };

  if (!event) {
    return (
      <div className="text-center py-12">
        <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No event selected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please select an event to view its details.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <FaArrowLeft className="mr-2" />
          Back to Events
        </button>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = qrCodeData;
              link.download = `event-${event.id}-qr.png`;
              link.click();
            }}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FaDownload className="mr-2" />
            Download QR
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FaPrint className="mr-2" />
            Print
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-800' :
          message.type === 'error' ? 'bg-red-50 text-red-800' :
          'bg-blue-50 text-blue-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;

import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaPlus, FaUsers, FaChartBar, FaCog, FaBell, FaCheckCircle, FaClock, FaMapMarkerAlt, FaTicketAlt, FaFileAlt, FaQrcode, FaCamera, FaDownload, FaUpload, FaListUl } from 'react-icons/fa';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import EventCreation from './EventCreation';
import EventCalendar from './EventCalendar';
import EventRegistrations from './EventRegistrations';
import EventResources from './EventResources';
import EventExecution from './EventExecution';
import EventReports from './EventReports';
import EventSettings from './EventSettings';
import EventList from './EventList';
import EventDetails from './EventDetails';
import BulkImportEvents from '../BulkImportEvents';

const EventManagement = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    ongoingEvents: 0,
    totalRegistrations: 0,
    pendingApprovals: 0
  });
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, orderBy('createdAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      
      const eventsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setEvents(eventsData);
      
      // Calculate stats
      const now = new Date();
      const upcoming = eventsData.filter(event => new Date(event.startDate) > now);
      const ongoing = eventsData.filter(event => {
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        return now >= start && now <= end;
      });
      const pending = eventsData.filter(event => event.status === 'pending');
      
      setStats({
        totalEvents: eventsData.length,
        upcomingEvents: upcoming.length,
        ongoingEvents: ongoing.length,
        totalRegistrations: eventsData.reduce((sum, event) => sum + (event.registrations?.length || 0), 0),
        pendingApprovals: pending.length
      });
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FaCalendarAlt },
    { id: 'list', label: 'All Events', icon: FaListUl },
    { id: 'creation', label: 'Event Creation', icon: FaPlus },
    { id: 'calendar', label: 'Event Calendar', icon: FaCalendarAlt },
    { id: 'registrations', label: 'Registrations', icon: FaUsers },
    { id: 'resources', label: 'Resources', icon: FaCog },
    { id: 'execution', label: 'Event Execution', icon: FaCheckCircle },
    { id: 'reports', label: 'Reports & Analytics', icon: FaChartBar },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <EventDashboard 
          events={events} 
          stats={stats} 
          onRefresh={fetchEvents}
          onViewAllEvents={() => setActiveTab('list')}
        />;
      case 'list':
        return (
          <EventList 
            events={events} 
            onRefresh={fetchEvents}
            onEdit={(event) => {
              setEditingEvent(event);
              setShowEditModal(true);
            }}
            onView={(event) => {
              setSelectedEvent(event);
              setShowEventDetails(true);
            }}
          />
        );
      case 'creation':
        return <EventCreation onEventCreated={fetchEvents} />;
      case 'calendar':
        return <EventCalendar events={events} onRefresh={fetchEvents} />;
      case 'registrations':
        return <EventRegistrations events={events} onRefresh={fetchEvents} />;
      case 'resources':
        return <EventResources />;
      case 'execution':
        return <EventExecution events={events} onRefresh={fetchEvents} />;
      case 'reports':
        return <EventReports events={events} />;
      case 'settings':
        return <EventSettings />;
      default:
        return <EventDashboard events={events} stats={stats} onRefresh={fetchEvents} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage all university events, registrations, and resources
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setActiveTab('creation')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaPlus className="mr-2" />
                Create Event
              </button>
              <button
                onClick={() => setShowBulkImport(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FaUpload className="mr-2" />
                Bulk Import
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
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
          {renderTabContent()}
        </div>
      </div>

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <BulkImportEvents
          onClose={() => setShowBulkImport(false)}
          onSuccess={(count) => {
            setShowBulkImport(false);
            fetchEvents();
            alert(`Successfully imported ${count} events!`);
          }}
        />
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
            <EventDetails
              event={selectedEvent}
              onClose={() => {
                setShowEventDetails(false);
                setSelectedEvent(null);
              }}
              onEdit={(event) => {
                setShowEventDetails(false);
                setSelectedEvent(null);
                setEditingEvent(event);
                setShowEditModal(true);
              }}
              onRefresh={fetchEvents}
            />
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Event</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingEvent(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <EventCreation 
                onEventCreated={() => {
                  setShowEditModal(false);
                  setEditingEvent(null);
                  fetchEvents();
                }}
                editingEvent={editingEvent}
                isEditing={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Dashboard Component
const EventDashboard = ({ events, stats, onRefresh, onViewAllEvents }) => {
  const upcomingEvents = events.filter(event => new Date(event.startDate) > new Date()).slice(0, 5);
  const recentEvents = events.slice(0, 5);

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <FaCalendarAlt className="h-8 w-8" />
            <div className="ml-4">
              <p className="text-sm opacity-90">Total Events</p>
              <p className="text-2xl font-bold">{stats.totalEvents}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <FaClock className="h-8 w-8" />
            <div className="ml-4">
              <p className="text-sm opacity-90">Upcoming</p>
              <p className="text-2xl font-bold">{stats.upcomingEvents}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <FaCheckCircle className="h-8 w-8" />
            <div className="ml-4">
              <p className="text-sm opacity-90">Ongoing</p>
              <p className="text-2xl font-bold">{stats.ongoingEvents}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <FaUsers className="h-8 w-8" />
            <div className="ml-4">
              <p className="text-sm opacity-90">Registrations</p>
              <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <FaBell className="h-8 w-8" />
            <div className="ml-4">
              <p className="text-sm opacity-90">Pending</p>
              <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Events</h3>
          </div>
          <div className="p-6">
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FaCalendarAlt className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.startDate).toLocaleDateString()} • {event.venue}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        event.status === 'approved' ? 'bg-green-100 text-green-800' :
                        event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming events</p>
            )}
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Events</h3>
            {onViewAllEvents && (
              <button
                onClick={onViewAllEvents}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All Events →
              </button>
            )}
          </div>
          <div className="p-6">
            {recentEvents.length > 0 ? (
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <FaCheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.startDate).toLocaleDateString()} • {event.category}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-sm text-gray-500">
                        {event.registrations?.length || 0} participants
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent events</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventManagement;

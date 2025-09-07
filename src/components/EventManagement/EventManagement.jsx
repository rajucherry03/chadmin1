// TODO: This component needs Django API integration - Firebase imports removed
import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaPlus, FaUsers, FaChartBar, FaCog, FaBell, FaCheckCircle, FaClock, FaMapMarkerAlt, FaTicketAlt, FaFileAlt, FaQrcode, FaCamera, FaDownload, FaUpload, FaListUl } from 'react-icons/fa';
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Event Management</h1>
            <p className="mt-1 text-blue-100">Manage all university events, registrations, and resources</p>
          </div>
          <div className="px-6 py-4 flex flex-wrap gap-3 justify-between items-center">
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('creation')}
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow hover:shadow-md transition"
              >
                <FaPlus className="mr-2" />
                Create Event
              </button>
              <button
                onClick={() => setShowBulkImport(true)}
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow hover:shadow-md transition"
              >
                <FaUpload className="mr-2" />
                Bulk Import
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <nav className="flex gap-3 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 border-blue-600'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                  }`}
                >
                  <span className="inline-flex items-center gap-2"><Icon className="h-4 w-4" />{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Event</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingEvent(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white"
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upcoming Events</h3>
          </div>
          <div className="p-6">
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <FaCalendarAlt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{event.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(event.startDate).toLocaleDateString()} • {event.venue}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        event.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        event.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming events</p>
            )}
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Events</h3>
            {onViewAllEvents && (
              <button
                onClick={onViewAllEvents}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                View All Events →
              </button>
            )}
          </div>
          <div className="p-6">
            {recentEvents.length > 0 ? (
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <FaCheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{event.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(event.startDate).toLocaleDateString()} • {event.category}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {event.registrations?.length || 0} participants
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent events</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventManagement;

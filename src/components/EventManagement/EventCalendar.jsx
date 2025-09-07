// TODO: This component needs Django API integration - Firebase imports removed
import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaFilter, FaSearch, FaMapMarkerAlt, FaUsers, FaClock, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
const EventCalendar = ({ events, onRefresh }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // month, week, list
  const [filters, setFilters] = useState({
    category: '',
    department: '',
    status: '',
    search: ''
  });
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [clashDetected, setClashDetected] = useState([]);

  useEffect(() => {
    applyFilters();
    detectClashes();
  }, [events, filters, currentDate]);

  const applyFilters = () => {
    let filtered = [...events];

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.venue.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(event => event.category === filters.category);
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(event => event.status === filters.status);
    }

    // Apply date filter based on view mode
    if (viewMode === 'month') {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate >= startOfMonth && eventDate <= endOfMonth;
      });
    }

    setFilteredEvents(filtered);
  };

  const detectClashes = () => {
    const clashes = [];
    const eventsByDate = {};

    // Group events by date
    filteredEvents.forEach(event => {
      const date = new Date(event.startDate).toDateString();
      if (!eventsByDate[date]) {
        eventsByDate[date] = [];
      }
      eventsByDate[date].push(event);
    });

    // Check for clashes (same venue, overlapping time)
    Object.values(eventsByDate).forEach(dayEvents => {
      if (dayEvents.length > 1) {
        for (let i = 0; i < dayEvents.length; i++) {
          for (let j = i + 1; j < dayEvents.length; j++) {
            const event1 = dayEvents[i];
            const event2 = dayEvents[j];

            if (event1.venue === event2.venue) {
              const start1 = new Date(`${event1.startDate} ${event1.startTime || '00:00'}`);
              const end1 = new Date(`${event1.endDate} ${event1.endTime || '23:59'}`);
              const start2 = new Date(`${event2.startDate} ${event2.startTime || '00:00'}`);
              const end2 = new Date(`${event2.endDate} ${event2.endTime || '23:59'}`);

              if (start1 < end2 && start2 < end1) {
                clashes.push({
                  event1,
                  event2,
                  date: new Date(event1.startDate).toDateString(),
                  venue: event1.venue
                });
              }
            }
          }
        }
      }
    });

    setClashDetected(clashes);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Academic': 'bg-blue-500',
      'Cultural': 'bg-purple-500',
      'Technical': 'bg-green-500',
      'Sports': 'bg-orange-500',
      'Placement': 'bg-red-500',
      'Workshop': 'bg-indigo-500',
      'Seminar': 'bg-pink-500',
      'Conference': 'bg-teal-500',
      'Hackathon': 'bg-yellow-500',
      'Competition': 'bg-red-600',
      'Guest Lecture': 'bg-blue-600',
      'Other': 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-white rounded-lg shadow">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              ←
            </button>
            <h2 className="text-xl font-semibold">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              →
            </button>
          </div>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Today
          </button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {weekDays.map(day => (
            <div key={day} className="bg-white p-3 text-center font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days.map((day, index) => (
            <div
              key={index}
              className={`bg-white min-h-32 p-2 ${
                day && day.toDateString() === new Date().toDateString() ? 'bg-blue-50' : ''
              }`}
            >
              {day && (
                <>
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {getEventsForDate(day).slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded cursor-pointer ${getCategoryColor(event.category)} text-white truncate`}
                        title={event.title}
                        onClick={() => setSelectedDate(day)}
                      >
                        {event.title}
                      </div>
                    ))}
                    {getEventsForDate(day).length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{getEventsForDate(day).length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="space-y-4">
        {filteredEvents.map(event => (
          <div key={event.id} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getCategoryColor(event.category)}`}>
                    {event.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{event.description}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-1" />
                    {new Date(event.startDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <FaClock className="mr-1" />
                    {event.startTime} - {event.endTime}
                  </div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-1" />
                    {event.venue}
                  </div>
                  <div className="flex items-center">
                    <FaUsers className="mr-1" />
                    {event.registrations?.length || 0} participants
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <FaEye />
                </button>
                <button className="p-2 text-green-600 hover:bg-green-50 rounded">
                  <FaEdit />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Event Calendar</h2>
        <p className="text-gray-600">View and manage all events in a centralized calendar</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="Academic">Academic</option>
            <option value="Cultural">Cultural</option>
            <option value="Technical">Technical</option>
            <option value="Sports">Sports</option>
            <option value="Placement">Placement</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
            <option value="Conference">Conference</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Competition">Competition</option>
            <option value="Guest Lecture">Guest Lecture</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>

          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-2 rounded-md ${
                viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Clash Detection Warning */}
      {clashDetected.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <FaClock className="text-yellow-600 mr-2" />
            <h3 className="text-yellow-800 font-medium">Schedule Conflicts Detected</h3>
          </div>
          <div className="mt-2 space-y-2">
            {clashDetected.map((clash, index) => (
              <div key={index} className="text-sm text-yellow-700">
                <strong>{clash.date}</strong> at <strong>{clash.venue}</strong>: 
                "{clash.event1.title}" conflicts with "{clash.event2.title}"
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'month' ? renderMonthView() : renderListView()}

      {/* Selected Date Events Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Events on {selectedDate.toLocaleDateString()}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              {getEventsForDate(selectedDate).map(event => (
                <div key={event.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-gray-600">{event.venue}</p>
                      <p className="text-sm text-gray-500">
                        {event.startTime} - {event.endTime}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCalendar;

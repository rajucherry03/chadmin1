import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, FaSearch, FaFilter, FaSort, FaEye, FaEdit, FaTrash, 
  FaUsers, FaMapMarkerAlt, FaClock, FaCheckCircle, FaTimes, FaExclamationTriangle,
  FaDownload, FaUpload, FaQrcode, FaPrint, FaShare, FaBookmark, FaStar
} from 'react-icons/fa';
import { collection, query, where, getDocs, orderBy, limit, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const EventList = ({ events, onRefresh, onEdit, onView }) => {
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    dateRange: '',
    venue: '',
    organizer: ''
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, table
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const eventCategories = [
    'Academic', 'Cultural', 'Technical', 'Sports', 'Placement', 
    'Workshop', 'Seminar', 'Conference', 'Hackathon', 'Competition', 
    'Guest Lecture', 'Other'
  ];

  const eventStatuses = [
    'draft', 'pending', 'approved', 'rejected', 'ongoing', 'completed', 'cancelled'
  ];

  useEffect(() => {
    applyFiltersAndSort();
  }, [events, filters, sortBy, sortOrder]);

  const applyFiltersAndSort = () => {
    let filtered = [...events];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(event =>
        event.title?.toLowerCase().includes(searchTerm) ||
        event.description?.toLowerCase().includes(searchTerm) ||
        event.venue?.toLowerCase().includes(searchTerm) ||
        event.organizerName?.toLowerCase().includes(searchTerm) ||
        event.category?.toLowerCase().includes(searchTerm)
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

    // Apply date range filter
    if (filters.dateRange) {
      const now = new Date();
      switch (filters.dateRange) {
        case 'today':
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate.toDateString() === now.toDateString();
          });
          break;
        case 'week':
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate >= now && eventDate <= weekFromNow;
          });
          break;
        case 'month':
          const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate >= now && eventDate <= monthFromNow;
          });
          break;
        case 'past':
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate < now;
          });
          break;
        case 'upcoming':
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate > now;
          });
          break;
      }
    }

    // Apply venue filter
    if (filters.venue) {
      filtered = filtered.filter(event => 
        event.venue?.toLowerCase().includes(filters.venue.toLowerCase())
      );
    }

    // Apply organizer filter
    if (filters.organizer) {
      filtered = filtered.filter(event => 
        event.organizerName?.toLowerCase().includes(filters.organizer.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'startDate' || sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredEvents(filtered);
    setCurrentPage(1);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'events', eventId));
        onRefresh();
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEvents.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedEvents.length} events?`)) {
      try {
        setLoading(true);
        const deletePromises = selectedEvents.map(eventId => 
          deleteDoc(doc(db, 'events', eventId))
        );
        await Promise.all(deletePromises);
        setSelectedEvents([]);
        onRefresh();
      } catch (error) {
        console.error('Error deleting events:', error);
        alert('Failed to delete events');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'events', eventId), {
        status: newStatus,
        updatedAt: new Date()
      });
      onRefresh();
    } catch (error) {
      console.error('Error updating event status:', error);
      alert('Failed to update event status');
    } finally {
      setLoading(false);
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

  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {paginatedEvents.map((event) => (
        <div key={event.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {event.title}
                </h3>
                <div className="flex items-center space-x-2 mb-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(event.category)}`}>
                    {event.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={selectedEvents.includes(event.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedEvents([...selectedEvents, event.id]);
                    } else {
                      setSelectedEvents(selectedEvents.filter(id => id !== event.id));
                    }
                  }}
                  className="rounded border-gray-300"
                />
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {event.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <FaCalendarAlt className="mr-2" />
                {new Date(event.startDate).toLocaleDateString()}
                {event.endDate && event.endDate !== event.startDate && 
                  ` - ${new Date(event.endDate).toLocaleDateString()}`
                }
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <FaClock className="mr-2" />
                {event.startTime} - {event.endTime}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <FaMapMarkerAlt className="mr-2" />
                {event.venue}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <FaUsers className="mr-2" />
                {event.registrations?.length || 0} participants
                {event.maxParticipants && ` / ${event.maxParticipants}`}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onView(event)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="View Details"
                >
                  <FaEye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onEdit(event)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                  title="Edit Event"
                >
                  <FaEdit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete Event"
                >
                  <FaTrash className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleStatusChange(event.id, 'approved')}
                  className={`p-1 rounded ${event.status === 'approved' ? 'bg-green-100' : 'hover:bg-green-50'}`}
                  title="Approve"
                >
                  <FaCheckCircle className="h-3 w-3 text-green-600" />
                </button>
                <button
                  onClick={() => handleStatusChange(event.id, 'rejected')}
                  className={`p-1 rounded ${event.status === 'rejected' ? 'bg-red-100' : 'hover:bg-red-50'}`}
                  title="Reject"
                >
                  <FaTimes className="h-3 w-3 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {paginatedEvents.map((event) => (
        <div key={event.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(event.category)}`}>
                    {event.category}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{event.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    {new Date(event.startDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <FaClock className="mr-2" />
                    {event.startTime} - {event.endTime}
                  </div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2" />
                    {event.venue}
                  </div>
                  <div className="flex items-center">
                    <FaUsers className="mr-2" />
                    {event.registrations?.length || 0} participants
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <input
                  type="checkbox"
                  checked={selectedEvents.includes(event.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedEvents([...selectedEvents, event.id]);
                    } else {
                      setSelectedEvents(selectedEvents.filter(id => id !== event.id));
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onView(event)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="View Details"
                  >
                    <FaEye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit(event)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                    title="Edit Event"
                  >
                    <FaEdit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete Event"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={selectedEvents.length === paginatedEvents.length && paginatedEvents.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedEvents(paginatedEvents.map(event => event.id));
                  } else {
                    setSelectedEvents([]);
                  }
                }}
                className="rounded border-gray-300"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Event
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date & Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Venue
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Participants
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedEvents.map((event) => (
            <tr key={event.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedEvents.includes(event.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedEvents([...selectedEvents, event.id]);
                    } else {
                      setSelectedEvents(selectedEvents.filter(id => id !== event.id));
                    }
                  }}
                  className="rounded border-gray-300"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{event.title}</div>
                  <div className="text-sm text-gray-500">{event.organizerName}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(event.category)}`}>
                  {event.category}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {new Date(event.startDate).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-500">
                  {event.startTime} - {event.endTime}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {event.venue}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {event.registrations?.length || 0}
                {event.maxParticipants && ` / ${event.maxParticipants}`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onView(event)}
                    className="text-blue-600 hover:text-blue-900"
                    title="View Details"
                  >
                    <FaEye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit(event)}
                    className="text-green-600 hover:text-green-900"
                    title="Edit Event"
                  >
                    <FaEdit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete Event"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Events</h2>
            <p className="text-gray-600">
              Showing {filteredEvents.length} of {events.length} events
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FaFilter className="mr-2" />
              Filters
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Grid View"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="List View"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Table View"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events by title, description, venue, or organizer..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="createdAt">Created Date</option>
              <option value="startDate">Start Date</option>
              <option value="title">Title</option>
              <option value="category">Category</option>
              <option value="status">Status</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <FaSort className={`h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All Categories</option>
                  {eventCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All Statuses</option>
                  {eventStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="past">Past Events</option>
                  <option value="upcoming">Upcoming Events</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                <input
                  type="text"
                  placeholder="Filter by venue..."
                  value={filters.venue}
                  onChange={(e) => setFilters({ ...filters, venue: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organizer</label>
                <input
                  type="text"
                  placeholder="Filter by organizer..."
                  value={filters.organizer}
                  onChange={(e) => setFilters({ ...filters, organizer: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({
                    search: '', category: '', status: '', dateRange: '', venue: '', organizer: ''
                  })}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedEvents.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedEvents.length} event(s) selected
              </span>
              <button
                onClick={() => setSelectedEvents([])}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear Selection
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
              >
                <FaTrash className="mr-1" />
                Delete Selected
              </button>
              <button
                onClick={() => {
                  selectedEvents.forEach(eventId => handleStatusChange(eventId, 'approved'));
                }}
                className="inline-flex items-center px-3 py-1 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-white hover:bg-green-50"
              >
                <FaCheckCircle className="mr-1" />
                Approve All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Events Display */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <>
            <div className="p-6">
              {viewMode === 'grid' && renderGridView()}
              {viewMode === 'list' && renderListView()}
              {viewMode === 'table' && renderTableView()}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredEvents.length)} of {filteredEvents.length} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 border rounded-md text-sm ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventList;

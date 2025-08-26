import React, { useState, useEffect } from 'react';
import { FaChartBar, FaDownload, FaFilter, FaCalendarAlt, FaUsers, FaMoneyBillWave, FaStar, FaChartLine, FaChartPie } from 'react-icons/fa';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

const EventReports = ({ events }) => {
  const [filters, setFilters] = useState({
    dateRange: 'all',
    category: '',
    department: '',
    status: ''
  });
  const [analytics, setAnalytics] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    totalRevenue: 0,
    averageRating: 0,
    categoryBreakdown: {},
    monthlyTrends: {},
    departmentStats: {},
    attendanceRates: {}
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculateAnalytics();
  }, [events, filters]);

  const calculateAnalytics = () => {
    setLoading(true);
    
    try {
      let filteredEvents = [...events];

      // Apply filters
      if (filters.category) {
        filteredEvents = filteredEvents.filter(event => event.category === filters.category);
      }
      if (filters.status) {
        filteredEvents = filteredEvents.filter(event => event.status === filters.status);
      }
      if (filters.dateRange !== 'all') {
        const now = new Date();
        const startDate = new Date();
        
        switch (filters.dateRange) {
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'quarter':
            startDate.setMonth(now.getMonth() - 3);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.startDate) >= startDate
        );
      }

      // Calculate basic stats
      const totalEvents = filteredEvents.length;
      const totalRegistrations = filteredEvents.reduce((sum, event) => 
        sum + (event.registrations?.length || 0), 0
      );
      const totalRevenue = filteredEvents.reduce((sum, event) => {
        if (event.isPaid && event.registrations) {
          return sum + (event.registrations.length * (event.ticketPrice || 0));
        }
        return sum;
      }, 0);

      // Calculate average rating
      const eventsWithFeedback = filteredEvents.filter(event => event.feedback && event.feedback.length > 0);
      const averageRating = eventsWithFeedback.length > 0 
        ? eventsWithFeedback.reduce((sum, event) => {
            const avgEventRating = event.feedback.reduce((eventSum, feedback) => 
              eventSum + (feedback.rating || 0), 0
            ) / event.feedback.length;
            return sum + avgEventRating;
          }, 0) / eventsWithFeedback.length
        : 0;

      // Category breakdown
      const categoryBreakdown = {};
      filteredEvents.forEach(event => {
        categoryBreakdown[event.category] = (categoryBreakdown[event.category] || 0) + 1;
      });

      // Monthly trends
      const monthlyTrends = {};
      filteredEvents.forEach(event => {
        const month = new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyTrends[month] = (monthlyTrends[month] || 0) + 1;
      });

      // Department stats
      const departmentStats = {};
      filteredEvents.forEach(event => {
        if (event.facultyCoordinators) {
          event.facultyCoordinators.forEach(coordinatorId => {
            // In a real app, you'd fetch faculty details to get department
            const department = 'Computer Science'; // Placeholder
            departmentStats[department] = (departmentStats[department] || 0) + 1;
          });
        }
      });

      // Attendance rates
      const attendanceRates = {};
      filteredEvents.forEach(event => {
        if (event.registrations && event.attendance) {
          const totalRegistered = event.registrations.length;
          const totalAttended = event.attendance.filter(att => att.status === 'present').length;
          const rate = totalRegistered > 0 ? (totalAttended / totalRegistered) * 100 : 0;
          attendanceRates[event.title] = Math.round(rate);
        }
      });

      setAnalytics({
        totalEvents,
        totalRegistrations,
        totalRevenue,
        averageRating: Math.round(averageRating * 10) / 10,
        categoryBreakdown,
        monthlyTrends,
        departmentStats,
        attendanceRates
      });
    } catch (error) {
      console.error('Error calculating analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (type) => {
    let data = [];
    let filename = '';

    switch (type) {
      case 'events':
        data = events.map(event => ({
          'Event ID': event.id,
          'Title': event.title,
          'Category': event.category,
          'Start Date': new Date(event.startDate).toLocaleDateString(),
          'End Date': new Date(event.endDate).toLocaleDateString(),
          'Venue': event.venue,
          'Status': event.status,
          'Registrations': event.registrations?.length || 0,
          'Revenue': event.isPaid ? (event.registrations?.length || 0) * (event.ticketPrice || 0) : 0,
          'Organizer': event.organizerName
        }));
        filename = 'events_report.csv';
        break;

      case 'registrations':
        const registrationData = [];
        events.forEach(event => {
          if (event.registrations) {
            event.registrations.forEach(reg => {
              registrationData.push({
                'Event Title': event.title,
                'Registration ID': reg.registrationId,
                'Name': reg.name,
                'Email': reg.email,
                'Department': reg.department,
                'Roll No': reg.rollNo,
                'Registered At': new Date(reg.registeredAt).toLocaleString(),
                'Status': reg.status
              });
            });
          }
        });
        data = registrationData;
        filename = 'registrations_report.csv';
        break;

      case 'attendance':
        const attendanceData = [];
        events.forEach(event => {
          if (event.registrations && event.attendance) {
            event.registrations.forEach(reg => {
              const attendance = event.attendance.find(att => att.registrationId === reg.registrationId);
              attendanceData.push({
                'Event Title': event.title,
                'Registration ID': reg.registrationId,
                'Name': reg.name,
                'Department': reg.department,
                'Attendance Status': attendance ? attendance.status : 'Not Marked',
                'Marked At': attendance ? new Date(attendance.markedAt).toLocaleString() : 'N/A'
              });
            });
          }
        });
        data = attendanceData;
        filename = 'attendance_report.csv';
        break;

      case 'feedback':
        const feedbackData = [];
        events.forEach(event => {
          if (event.feedback) {
            event.feedback.forEach(feedback => {
              feedbackData.push({
                'Event Title': event.title,
                'Rating': feedback.rating,
                'Comment': feedback.comment,
                'Submitted At': new Date(feedback.submittedAt).toLocaleString(),
                'Participant': feedback.participantName
              });
            });
          }
        });
        data = feedbackData;
        filename = 'feedback_report.csv';
        break;

      default:
        return;
    }

    if (data.length === 0) {
      alert('No data available for export');
      return;
    }

    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <p className="text-gray-600">Comprehensive analytics and reports for event management</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
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
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <FaCalendarAlt className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalEvents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <FaUsers className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Registrations</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalRegistrations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <FaMoneyBillWave className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">₹{analytics.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <FaStar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.averageRating}/5</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Events by Category</h3>
          </div>
          <div className="p-6">
            {Object.keys(analytics.categoryBreakdown).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(analytics.categoryBreakdown).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full ${getCategoryColor(category)} mr-3`}></div>
                      <span className="text-sm font-medium text-gray-900">{category}</span>
                    </div>
                    <span className="text-sm text-gray-500">{count} events</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Monthly Trends</h3>
          </div>
          <div className="p-6">
            {Object.keys(analytics.monthlyTrends).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(analytics.monthlyTrends).map(([month, count]) => (
                  <div key={month} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{month}</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(count / Math.max(...Object.values(analytics.monthlyTrends))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Rates */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Event Attendance Rates</h3>
        </div>
        <div className="p-6">
          {Object.keys(analytics.attendanceRates).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(analytics.attendanceRates).map(([eventTitle, rate]) => (
                <div key={eventTitle} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 truncate max-w-xs">{eventTitle}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className={`h-2 rounded-full ${rate >= 80 ? 'bg-green-600' : rate >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                        style={{ width: `${rate}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No attendance data available</p>
          )}
        </div>
      </div>

      {/* Export Reports */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Export Reports</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => exportReport('events')}
              className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <FaCalendarAlt className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Events Report</p>
                <p className="text-xs text-gray-500">All event details</p>
              </div>
            </button>

            <button
              onClick={() => exportReport('registrations')}
              className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <FaUsers className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Registrations Report</p>
                <p className="text-xs text-gray-500">Participant data</p>
              </div>
            </button>

            <button
              onClick={() => exportReport('attendance')}
              className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <FaChartBar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Attendance Report</p>
                <p className="text-xs text-gray-500">Attendance records</p>
              </div>
            </button>

            <button
              onClick={() => exportReport('feedback')}
              className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <FaStar className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Feedback Report</p>
                <p className="text-xs text-gray-500">Event feedback</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventReports;

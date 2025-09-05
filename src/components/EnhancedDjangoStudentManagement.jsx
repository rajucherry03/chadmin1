import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserGraduate, faPlus, faUpload, faIdCard, faEnvelope, faFileAlt,
  faChartBar, faCog, faDownload, faSearch, faFilter, faEye, faEdit, 
  faTrash, faCheckCircle, faExclamationTriangle, faUsers, faBell, 
  faDatabase, faShieldAlt, faPalette, faTimes, faChevronDown, 
  faChevronUp, faBolt, faArrowRight, faKey, faUserPlus, faGraduationCap,
  faCalendarAlt, faPhone, faMapMarkerAlt, faCreditCard, faCertificate,
  faClipboardList, faUserCheck, faEnvelopeOpen, faLock, faUnlock,
  faRandom, faQrcode, faPrint, faShare, faHistory, faChartLine,
  faUserFriends, faBookOpen, faCalendarCheck, faClipboardCheck,
  faSpinner, faRefresh, faSave, faUndo, faUpload as faUploadIcon,
  faDownload as faDownloadIcon, faFileImport, faFileExport
} from '@fortawesome/free-solid-svg-icons';
import { useDjangoAuth } from '../contexts/DjangoAuthContext';
import StudentsApiTest from './StudentsApiTest';
import StudentDetailsView from './StudentDetailsView';

const EnhancedDjangoStudentManagement = () => {
  const navigate = useNavigate();
  const { students } = useDjangoAuth();
  
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("edsm.activeTab") || "overview");
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("edsm.searchTerm") || "");
  const [filterYear, setFilterYear] = useState(() => localStorage.getItem("edsm.filterYear") || "");
  const [filterDepartment, setFilterDepartment] = useState(() => localStorage.getItem("edsm.filterDepartment") || "");
  const [filterStatus, setFilterStatus] = useState(() => localStorage.getItem("edsm.filterStatus") || "");
  const [sortBy, setSortBy] = useState(() => localStorage.getItem("edsm.sortBy") || "firstName");
  const [sortDir, setSortDir] = useState(() => localStorage.getItem("edsm.sortDir") || "asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [bulkAction, setBulkAction] = useState("enable");
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem("edsm.activeTab", activeTab);
    localStorage.setItem("edsm.searchTerm", searchTerm);
    localStorage.setItem("edsm.filterYear", filterYear);
    localStorage.setItem("edsm.filterDepartment", filterDepartment);
    localStorage.setItem("edsm.filterStatus", filterStatus);
    localStorage.setItem("edsm.sortBy", sortBy);
    localStorage.setItem("edsm.sortDir", sortDir);
  }, [activeTab, searchTerm, filterYear, filterDepartment, filterStatus, sortBy, sortDir]);

  // Load students data
  const loadStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const searchParams = {
        search: searchTerm,
        year: filterYear,
        department: filterDepartment,
        status: filterStatus,
        page: currentPage,
        page_size: pageSize,
        ordering: sortDir === 'desc' ? `-${sortBy}` : sortBy
      };

      const result = await students.getStudents(searchParams);
      if (result.success) {
        setStudentsData(result.data || []);
        setSuccess(`Loaded ${result.data?.length || 0} students successfully`);
      } else {
        setError(result.error || 'Failed to load students');
      }
    } catch (err) {
      setError('Network error occurred while loading students');
      console.error('Load students error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const result = await students.getStudentsStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Load stats error:', err);
    }
  };

  // Load analytics
  const loadAnalytics = async () => {
    try {
      const result = await students.getStudentAnalytics({
        year: filterYear,
        department: filterDepartment,
        status: filterStatus
      });
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (err) {
      console.error('Load analytics error:', err);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    loadStudents();
    loadStats();
    if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [currentPage, pageSize, sortBy, sortDir, filterYear, filterDepartment, filterStatus, activeTab]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== localStorage.getItem("edsm.searchTerm")) {
        loadStudents();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    loadStudents();
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (selectedStudents.length === 0) {
      setError('Please select students for bulk action');
      return;
    }

    setLoading(true);
    try {
      let result;
      switch (bulkAction) {
        case 'delete':
          result = await students.bulkDeleteStudents(selectedStudents);
          break;
        case 'update_status':
          result = await students.bulkUpdateStudents({
            student_ids: selectedStudents,
            status: 'active'
          });
          break;
        default:
          setError('Invalid bulk action');
          return;
      }

      if (result.success) {
        setSuccess(`Bulk ${bulkAction} completed successfully`);
        setSelectedStudents([]);
        setShowBulkActions(false);
        loadStudents();
        loadStats();
      } else {
        setError(result.error || `Failed to perform bulk ${bulkAction}`);
      }
    } catch (err) {
      setError(`Network error during bulk ${bulkAction}`);
      console.error('Bulk action error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle export
  const handleExport = async (format = 'csv') => {
    try {
      const result = await students.exportStudentsData({
        search: searchTerm,
        year: filterYear,
        department: filterDepartment,
        status: filterStatus
      }, format);

      if (result.success) {
        setSuccess(`Data exported successfully in ${format.toUpperCase()} format`);
        // Handle file download
        if (result.data.download_url) {
          window.open(result.data.download_url, '_blank');
        }
      } else {
        setError(result.error || 'Failed to export data');
      }
    } catch (err) {
      setError('Network error during export');
      console.error('Export error:', err);
    }
  };

  // Handle import
  const handleImport = async (file) => {
    if (!file) return;

    setLoading(true);
    try {
      const result = await students.importStudentsData(file, {
        department: filterDepartment,
        year: filterYear
      });

      if (result.success) {
        setSuccess(`Import completed: ${result.data.created} created, ${result.data.failed} failed`);
        loadStudents();
        loadStats();
      } else {
        setError(result.error || 'Failed to import data');
      }
    } catch (err) {
      setError('Network error during import');
      console.error('Import error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Clear messages
  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: faUserGraduate },
    { id: 'students', label: 'Students', icon: faUsers },
    { id: 'analytics', label: 'Analytics', icon: faChartBar },
    { id: 'documents', label: 'Documents', icon: faFileAlt },
    { id: 'bulk', label: 'Bulk Operations', icon: faUpload },
    { id: 'settings', label: 'Settings', icon: faCog }
  ];

  // Render overview tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <FontAwesomeIcon icon={faUsers} className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.total_students || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <FontAwesomeIcon icon={faCheckCircle} className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Students</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.active_students || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Inactive Students</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.inactive_students || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
              <FontAwesomeIcon icon={faGraduationCap} className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Departments</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.total_departments || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('students')}
            className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Add Student</span>
          </button>

          <button
            onClick={() => setActiveTab('bulk')}
            className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faUpload} className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Bulk Import</span>
          </button>

          <button
            onClick={() => handleExport('csv')}
            className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faDownload} className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Export Data</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faChartBar} className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-3" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Render students tab
  const renderStudents = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faSearch} />
              )}
              Search
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FontAwesomeIcon icon={faFilter} />
              Filters
            </button>

            <button
              onClick={loadStudents}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FontAwesomeIcon icon={faRefresh} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>

            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="graduated">Graduated</option>
            </select>
          </div>
        )}
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Students</h3>
            <div className="flex items-center gap-2">
              {selectedStudents.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedStudents.length} selected
                  </span>
                  <button
                    onClick={() => setShowBulkActions(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Bulk Actions
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === studentsData.length && studentsData.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents(studentsData.map(s => s.id));
                      } else {
                        setSelectedStudents([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Roll Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin h-6 w-6 text-blue-600" />
                  </td>
                </tr>
              ) : studentsData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No students found
                  </td>
                </tr>
              ) : (
                studentsData.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, student.id]);
                          } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {student.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {student.rollNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {student.department || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {student.academicYear || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : student.status === 'inactive'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {student.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/students/${student.id}`)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Details"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          onClick={() => navigate(`/students/${student.id}/edit`)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this student?')) {
                              students.deleteStudent(student.id).then(() => {
                                loadStudents();
                                loadStats();
                              });
                            }
                          }}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render analytics tab
  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Student Analytics</h3>
        {analytics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Analytics content would go here */}
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {analytics.total_students || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {analytics.active_students || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Students</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {analytics.departments || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Departments</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading analytics...</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render bulk operations tab
  const renderBulkOperations = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Bulk Operations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Import */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Import Students</h4>
            <div className="space-y-4">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => handleImport(e.target.files[0])}
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Upload CSV or Excel file with student data
              </p>
            </div>
          </div>

          {/* Export */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Export Students</h4>
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('csv')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FontAwesomeIcon icon={faFileExport} />
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport('xlsx')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FontAwesomeIcon icon={faFileExport} />
                  Export Excel
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Export current filtered data
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render settings tab
  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Page Size
            </label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  // Render current tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'students':
        return renderStudents();
      case 'analytics':
        return renderAnalytics();
      case 'bulk':
        return renderBulkOperations();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Enhanced Student Management
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Comprehensive Django-based student management system
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/students-api-test')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FontAwesomeIcon icon={faBolt} />
                API Test
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {(error || success) && (
        <div className="px-6 py-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                {error}
              </div>
              <button onClick={clearMessages} className="text-red-700 hover:text-red-900">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                {success}
              </div>
              <button onClick={clearMessages} className="text-green-700 hover:text-green-900">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} className="mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {renderTabContent()}
      </div>

      {/* Bulk Actions Modal */}
      {showBulkActions && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Bulk Actions
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Action
                  </label>
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="update_status">Update Status</option>
                    <option value="delete">Delete</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowBulkActions(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkAction}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition-colors"
                  >
                    {loading ? (
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    ) : (
                      'Execute'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDjangoStudentManagement;

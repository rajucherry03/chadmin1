import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faUserPlus, faFileAlt, faHistory, faUpload, 
  faCog, faChartBar, faSearch, faEdit, faTrash, faEye,
  faGraduationCap, faIdCard, faEnvelope, faHome, faBus
} from '@fortawesome/free-solid-svg-icons';
import studentApiService from '../../services/studentApiService';

// Import all the management components
import StudentCRUD from './StudentCRUD';
import CustomFieldsManager from './CustomFieldsManager';
import DocumentsManager from './DocumentsManager';
import EnrollmentHistoryManager from './EnrollmentHistoryManager';
import ImportOperationsManager from './ImportOperationsManager';

const StudentManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    total_students: 0,
    active_students: 0,
    new_admissions: 0,
    pending_documents: 0,
    total_enrollments: 0,
    recent_imports: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await studentApiService.getStudentStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: faChartBar },
    { id: 'students', name: 'Students', icon: faUsers },
    { id: 'custom-fields', name: 'Custom Fields', icon: faCog },
    { id: 'documents', name: 'Documents', icon: faFileAlt },
    { id: 'enrollment', name: 'Enrollment History', icon: faHistory },
    { id: 'imports', name: 'Import Operations', icon: faUpload }
  ];

  const quickActions = [
    {
      id: 'add-student',
      title: 'Add Student',
      description: 'Register a new student',
      icon: faUserPlus,
      color: 'bg-blue-500',
      action: () => setActiveTab('students')
    },
    {
      id: 'bulk-import',
      title: 'Bulk Import',
      description: 'Import students from file',
      icon: faUpload,
      color: 'bg-green-500',
      action: () => setActiveTab('imports')
    },
    {
      id: 'manage-documents',
      title: 'Manage Documents',
      description: 'Upload and manage student documents',
      icon: faFileAlt,
      color: 'bg-purple-500',
      action: () => setActiveTab('documents')
    },
    {
      id: 'enrollment-history',
      title: 'Enrollment History',
      description: 'View and manage enrollment records',
      icon: faHistory,
      color: 'bg-orange-500',
      action: () => setActiveTab('enrollment')
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Students</p>
                    <p className="text-3xl font-bold">{stats.total_students}</p>
                  </div>
                  <FontAwesomeIcon icon={faUsers} className="text-4xl text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Active Students</p>
                    <p className="text-3xl font-bold">{stats.active_students}</p>
                  </div>
                  <FontAwesomeIcon icon={faGraduationCap} className="text-4xl text-green-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">New Admissions</p>
                    <p className="text-3xl font-bold">{stats.new_admissions}</p>
                  </div>
                  <FontAwesomeIcon icon={faUserPlus} className="text-4xl text-purple-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Pending Documents</p>
                    <p className="text-3xl font-bold">{stats.pending_documents}</p>
                  </div>
                  <FontAwesomeIcon icon={faFileAlt} className="text-4xl text-orange-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100">Total Enrollments</p>
                    <p className="text-3xl font-bold">{stats.total_enrollments}</p>
                  </div>
                  <FontAwesomeIcon icon={faHistory} className="text-4xl text-red-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100">Recent Imports</p>
                    <p className="text-3xl font-bold">{stats.recent_imports}</p>
                  </div>
                  <FontAwesomeIcon icon={faUpload} className="text-4xl text-indigo-200" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left"
                  >
                    <div className={`${action.color} text-white p-3 rounded-lg w-fit mb-3`}>
                      <FontAwesomeIcon icon={action.icon} className="text-xl" />
                    </div>
                    <h4 className="font-semibold text-gray-900">{action.title}</h4>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FontAwesomeIcon icon={faUserPlus} className="text-green-500" />
                  <div>
                    <p className="text-sm font-medium">New student registered</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FontAwesomeIcon icon={faFileAlt} className="text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Document uploaded</p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FontAwesomeIcon icon={faUpload} className="text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Bulk import completed</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'students':
        return <StudentCRUD />;
      case 'custom-fields':
        return <CustomFieldsManager />;
      case 'documents':
        return <DocumentsManager />;
      case 'enrollment':
        return <EnrollmentHistoryManager />;
      case 'imports':
        return <ImportOperationsManager />;
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Student Management System</h1>
          <p className="text-gray-600">Comprehensive student data management</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading && activeTab === 'overview' ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
};

export default StudentManagementDashboard;

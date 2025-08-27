import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faFileAlt, faDownload, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const ReportsAnalytics = ({ userRole, applications, internships, companies, stats, loading, error }) => {
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive reports and data analytics</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-blue-600">{applications.length}</p>
            </div>
            <FontAwesomeIcon icon={faFileAlt} className="text-blue-600 text-xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {applications.length > 0 ? Math.round((applications.filter(app => app.status === 'placed').length / applications.length) * 100) : 0}%
              </p>
            </div>
            <FontAwesomeIcon icon={faChartBar} className="text-green-600 text-xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Companies</p>
              <p className="text-2xl font-bold text-purple-600">
                {companies.filter(c => c.status === 'active').length}
              </p>
            </div>
            <FontAwesomeIcon icon={faCalendarAlt} className="text-purple-600 text-xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Package</p>
              <p className="text-2xl font-bold text-yellow-600">
                ₹{stats.averagePackage || 0}
              </p>
            </div>
            <FontAwesomeIcon icon={faDownload} className="text-yellow-600 text-xl" />
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <div className="text-center">
              <FontAwesomeIcon icon={faFileAlt} className="text-blue-600 text-2xl mb-2" />
              <p className="font-medium text-gray-900">Placement Report</p>
              <p className="text-sm text-gray-600">Overall placement statistics</p>
            </div>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <div className="text-center">
              <FontAwesomeIcon icon={faChartBar} className="text-green-600 text-2xl mb-2" />
              <p className="font-medium text-gray-900">Company Analytics</p>
              <p className="text-sm text-gray-600">Company-wise performance</p>
            </div>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <div className="text-center">
              <FontAwesomeIcon icon={faDownload} className="text-purple-600 text-2xl mb-2" />
              <p className="font-medium text-gray-900">Export Data</p>
              <p className="text-sm text-gray-600">Download in various formats</p>
            </div>
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faChartBar} className="text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500">Analytics dashboard coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;

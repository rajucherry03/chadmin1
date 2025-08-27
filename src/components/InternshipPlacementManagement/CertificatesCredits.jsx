import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCertificate, faGraduationCap, faDownload, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const CertificatesCredits = ({ userRole, applications, loading, error }) => {
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
          <h1 className="text-2xl font-bold text-gray-900">Certificates & Credits</h1>
          <p className="text-gray-600">Manage internship certificates and academic credits</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Internships</p>
              <p className="text-2xl font-bold text-blue-600">
                {applications.filter(app => app.status === 'completed').length}
              </p>
            </div>
            <FontAwesomeIcon icon={faCertificate} className="text-blue-600 text-xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Certificates Issued</p>
              <p className="text-2xl font-bold text-green-600">
                {applications.filter(app => app.status === 'completed').length}
              </p>
            </div>
            <FontAwesomeIcon icon={faGraduationCap} className="text-green-600 text-xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Credits Awarded</p>
              <p className="text-2xl font-bold text-purple-600">
                {applications.filter(app => app.status === 'completed').length * 3}
              </p>
            </div>
            <FontAwesomeIcon icon={faCheckCircle} className="text-purple-600 text-xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">
                {applications.filter(app => app.status === 'pending').length}
              </p>
            </div>
            <FontAwesomeIcon icon={faDownload} className="text-yellow-600 text-xl" />
          </div>
        </div>
      </div>

      {/* Certificate Management */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate Management</h3>
        <div className="text-center py-8">
          <FontAwesomeIcon icon={faCertificate} className="text-gray-400 text-3xl mb-2" />
          <p className="text-gray-500">Certificate management system coming soon</p>
        </div>
      </div>

      {/* Credit System */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Academic Credits</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faGraduationCap} className="text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500">Credit system implementation coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatesCredits;

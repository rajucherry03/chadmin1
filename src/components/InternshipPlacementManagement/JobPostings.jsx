import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faBuilding, faUsers, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const JobPostings = ({ userRole, internships, companies, loading, error }) => {
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
          <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-600">Manage job postings and career opportunities</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-blue-600">
                {internships.filter(i => i.status === 'active').length}
              </p>
            </div>
            <FontAwesomeIcon icon={faBriefcase} className="text-blue-600 text-xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Companies</p>
              <p className="text-2xl font-bold text-green-600">{companies.length}</p>
            </div>
            <FontAwesomeIcon icon={faBuilding} className="text-green-600 text-xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Applications</p>
              <p className="text-2xl font-bold text-purple-600">0</p>
            </div>
            <FontAwesomeIcon icon={faUsers} className="text-purple-600 text-xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-yellow-600">
                {internships.filter(i => {
                  const created = new Date(i.createdAt);
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <FontAwesomeIcon icon={faCalendarAlt} className="text-yellow-600 text-xl" />
          </div>
        </div>
      </div>

      {/* Job Postings List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Job Postings</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faBriefcase} className="text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500">No job postings available</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPostings;

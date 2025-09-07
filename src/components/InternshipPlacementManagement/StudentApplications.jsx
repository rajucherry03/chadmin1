// TODO: This component needs Django API integration - Firebase imports removed
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileAlt, faUserGraduate, faCheckCircle, faTimesCircle, faClock,
  faEye, faEdit, faTrash, faDownload, faEnvelope, faPhone,
  faCalendarAlt, faBuilding, faMapMarkerAlt, faMoneyBillWave,
  faTimes, faSave, faExclamationTriangle, faUserCheck, faUserTimes, faBriefcase
} from '@fortawesome/free-solid-svg-icons';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp
} from 'firebase/firestore';

const StudentApplications = ({ 
  userRole, 
  applications, 
  internships, 
  students, 
  loading, 
  error,
  searchTerm 
}) => {
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterInternship, setFilterInternship] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    status: '',
    feedback: '',
    interviewDate: '',
    interviewLocation: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Filter applications
  const filteredApplications = applications.filter(application => {
    const matchesSearch = !searchTerm || 
      application.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.internshipTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || application.status === filterStatus;
    const matchesInternship = filterInternship === 'all' || application.internshipId === filterInternship;
    
    return matchesSearch && matchesStatus && matchesInternship;
  });

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleView = (application) => {
    setSelectedApplication(application);
    setShowViewModal(true);
  };

  const handleEdit = (application) => {
    setFormData({
      status: application.status || '',
      feedback: application.feedback || '',
      interviewDate: application.interviewDate || '',
      interviewLocation: application.interviewLocation || '',
      notes: application.notes || ''
    });
    setSelectedApplication(application);
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    // All fields optional
    setFormErrors({});
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const updateData = {
        ...formData,
        updatedAt: serverTimestamp(),
        updatedBy: userRole
      };
      
      await updateDoc(doc(db, 'internship_applications', selectedApplication.id), updateData);
      
      setShowEditModal(false);
      setSelectedApplication(null);
      setFormData({
        status: '',
        feedback: '',
        interviewDate: '',
        interviewLocation: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error updating application:', error);
      setFormErrors({ submit: 'Failed to update application. Please try again.' });
    }
  };

  const handleDelete = async (application) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await deleteDoc(doc(db, 'internship_applications', application.id));
      } catch (error) {
        console.error('Error deleting application:', error);
        alert('Failed to delete application. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'placed':
      case 'accepted':
        return 'text-green-600 bg-green-100';
      case 'pending':
      case 'under_review':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
      case 'withdrawn':
        return 'text-red-600 bg-red-100';
      case 'interview_scheduled':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'placed':
      case 'accepted':
        return faCheckCircle;
      case 'pending':
      case 'under_review':
        return faClock;
      case 'rejected':
      case 'withdrawn':
        return faTimesCircle;
      case 'interview_scheduled':
        return faUserCheck;
      default:
        return faFileAlt;
    }
  };

  const getStudentInfo = (studentId) => {
    return students.find(student => student.id === studentId) || {};
  };

  const getInternshipInfo = (internshipId) => {
    return internships.find(internship => internship.id === internshipId) || {};
  };

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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Applications</h1>
          <p className="text-gray-600">Manage and track student applications for internships</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="accepted">Accepted</option>
            <option value="placed">Placed</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
          <select
            value={filterInternship}
            onChange={(e) => setFilterInternship(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Internships</option>
            {internships.map(internship => (
              <option key={internship.id} value={internship.id}>{internship.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
            </div>
            <FontAwesomeIcon icon={faFileAlt} className="text-blue-600 text-xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">
                {applications.filter(app => app.status === 'pending' || app.status === 'under_review').length}
              </p>
            </div>
            <FontAwesomeIcon icon={faClock} className="text-yellow-600 text-xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accepted/Placed</p>
              <p className="text-2xl font-bold text-green-600">
                {applications.filter(app => app.status === 'accepted' || app.status === 'placed').length}
              </p>
            </div>
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {applications.filter(app => app.status === 'rejected').length}
              </p>
            </div>
            <FontAwesomeIcon icon={faTimesCircle} className="text-red-600 text-xl" />
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Internship
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedApplications.map((application) => {
                const student = getStudentInfo(application.studentId);
                const internship = getInternshipInfo(application.internshipId);
                
                return (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{application.studentName || student.name}</div>
                        <div className="text-sm text-gray-500">{student.email || application.studentEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{application.internshipTitle || internship.title}</div>
                        <div className="text-sm text-gray-500">{internship.department}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{application.companyName || internship.companyName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        <FontAwesomeIcon icon={getStatusIcon(application.status)} className="mr-1" />
                        {application.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleView(application)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          onClick={() => handleEdit(application)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleDelete(application)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredApplications.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredApplications.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Application Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faUserGraduate} className="text-gray-400 w-4 mr-3" />
                      <span className="text-gray-900">{selectedApplication.studentName}</span>
                    </div>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 w-4 mr-3" />
                      <span className="text-gray-900">{selectedApplication.studentEmail}</span>
                    </div>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faPhone} className="text-gray-400 w-4 mr-3" />
                      <span className="text-gray-900">{selectedApplication.studentPhone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Internship Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faBriefcase} className="text-gray-400 w-4 mr-3" />
                      <span className="text-gray-900">{selectedApplication.internshipTitle}</span>
                    </div>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faBuilding} className="text-gray-400 w-4 mr-3" />
                      <span className="text-gray-900">{selectedApplication.companyName}</span>
                    </div>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 w-4 mr-3" />
                      <span className="text-gray-900">{selectedApplication.location || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-3">Application Status</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedApplication.status)}`}>
                      <FontAwesomeIcon icon={getStatusIcon(selectedApplication.status)} className="mr-1" />
                      {selectedApplication.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Applied Date:</span>
                    <span className="font-medium">
                      {selectedApplication.createdAt ? new Date(selectedApplication.createdAt).toLocaleDateString() : 'Not available'}
                    </span>
                  </div>
                  {selectedApplication.interviewDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Interview Date:</span>
                      <span className="font-medium">
                        {new Date(selectedApplication.interviewDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {selectedApplication.feedback && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Feedback</h5>
                  <p className="text-gray-600">{selectedApplication.feedback}</p>
                </div>
              )}

              {selectedApplication.notes && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Notes</h5>
                  <p className="text-gray-600">{selectedApplication.notes}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => handleEdit(selectedApplication)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Update Application Status</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedApplication(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.status ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="accepted">Accepted</option>
                  <option value="placed">Placed</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
                {formErrors.status && <p className="text-red-500 text-xs mt-1">{formErrors.status}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                <textarea
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Provide feedback to the student"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interview Date</label>
                  <input
                    type="datetime-local"
                    name="interviewDate"
                    value={formData.interviewDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interview Location</label>
                  <input
                    type="text"
                    name="interviewLocation"
                    value={formData.interviewLocation}
                    onChange={handleInputChange}
                    placeholder="Interview venue or platform"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Additional notes or comments"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm">{formErrors.submit}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedApplication(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Update Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentApplications;

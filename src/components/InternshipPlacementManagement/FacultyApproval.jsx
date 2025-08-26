import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCheck, faUserTimes, faUserGraduate, faBuilding, faClock,
  faCheckCircle, faTimesCircle, faEye, faDownload, faUpload, faSearch,
  faFilter, faSort, faSortUp, faSortDown, faCalendarAlt, faMapMarkerAlt,
  faMoneyBillWave, faIndustry, faExclamationTriangle, faInfoCircle,
  faThumbsUp, faThumbsDown, faHourglassHalf, faArrowRight, faArrowLeft,
  faRefresh, faPrint, faShare, faEnvelope, faPhone, faFileAlt,
  faGraduationCap, faStar, faComments, faEdit, faTrash, faPlus
} from '@fortawesome/free-solid-svg-icons';
import internshipPlacementService from './services/internshipPlacementService';

const FacultyApproval = ({ userRole }) => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    facultyApproval: 'pending',
    status: '',
    department: '',
    internshipId: ''
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Approval form state
  const [approvalData, setApprovalData] = useState({
    applicationId: '',
    approvalStatus: 'approved', // approved, rejected
    comments: '',
    recommendations: '',
    conditions: '',
    nextSteps: ''
  });

  const [internships, setInternships] = useState([]);
  const [departments] = useState([
    'Computer Science & Engineering',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Information Technology',
    'Computer Applications',
    'Management Studies',
    'Basic Sciences & Humanities'
  ]);

  useEffect(() => {
    loadApplications();
    loadInternships();
  }, []);

  useEffect(() => {
    filterAndSortApplications();
  }, [applications, searchTerm, filters, sortBy, sortOrder]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await internshipPlacementService.getApplications();
      setApplications(data);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInternships = async () => {
    try {
      const data = await internshipPlacementService.getInternships({ status: 'active' });
      setInternships(data);
    } catch (error) {
      console.error('Error loading internships:', error);
    }
  };

  const filterAndSortApplications = () => {
    let filtered = [...applications];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(application =>
        application.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.internshipTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.facultyApproval) {
      filtered = filtered.filter(application => application.facultyApproval === filters.facultyApproval);
    }
    if (filters.status) {
      filtered = filtered.filter(application => application.status === filters.status);
    }
    if (filters.department) {
      filtered = filtered.filter(application => application.department === filters.department);
    }
    if (filters.internshipId) {
      filtered = filtered.filter(application => application.internshipId === filters.internshipId);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredApplications(filtered);
  };

  const handleApproval = async (e) => {
    e.preventDefault();
    try {
      await internshipPlacementService.updateApplicationStatus(
        approvalData.applicationId,
        approvalData.approvalStatus,
        'faculty'
      );

      // Create notification for student
      await internshipPlacementService.createNotification({
        userId: selectedApplication.studentId,
        type: 'faculty_approval',
        title: `Application ${approvalData.approvalStatus === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `Your application for ${selectedApplication.internshipTitle} has been ${approvalData.approvalStatus === 'approved' ? 'approved' : 'rejected'} by faculty.`,
        data: {
          applicationId: approvalData.applicationId,
          status: approvalData.approvalStatus,
          comments: approvalData.comments
        }
      });

      setShowApprovalModal(false);
      setApprovalData({
        applicationId: '',
        approvalStatus: 'approved',
        comments: '',
        recommendations: '',
        conditions: '',
        nextSteps: ''
      });
      loadApplications();
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const handleBulkApproval = async (applicationIds, status) => {
    try {
      await internshipPlacementService.bulkUpdateApplicationStatus(applicationIds, status, 'faculty');
      loadApplications();
    } catch (error) {
      console.error('Error bulk updating applications:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'faculty_approved':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalColor = (approval) => {
    switch (approval) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
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
          <h1 className="text-2xl font-bold text-gray-900">Faculty Approval</h1>
          <p className="text-gray-600">
            Review and approve/reject internship applications
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={loadApplications}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faRefresh} />
            <span>Refresh</span>
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const pendingIds = filteredApplications
                  .filter(app => app.facultyApproval === 'pending')
                  .map(app => app.id);
                if (pendingIds.length > 0) {
                  handleBulkApproval(pendingIds, 'approved');
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FontAwesomeIcon icon={faCheckCircle} />
              <span>Bulk Approve</span>
            </button>
            <button
              onClick={() => {
                const pendingIds = filteredApplications
                  .filter(app => app.facultyApproval === 'pending')
                  .map(app => app.id);
                if (pendingIds.length > 0) {
                  handleBulkApproval(pendingIds, 'rejected');
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FontAwesomeIcon icon={faTimesCircle} />
              <span>Bulk Reject</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">
                {applications.filter(app => app.facultyApproval === 'pending').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FontAwesomeIcon icon={faHourglassHalf} className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {applications.filter(app => app.facultyApproval === 'approved').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {applications.filter(app => app.facultyApproval === 'rejected').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <FontAwesomeIcon icon={faTimesCircle} className="text-red-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-blue-600">{applications.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FontAwesomeIcon icon={faFileAlt} className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Faculty Approval Filter */}
          <select
            value={filters.facultyApproval}
            onChange={(e) => setFilters({ ...filters, facultyApproval: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Approval Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Department Filter */}
          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Additional Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="faculty_approved">Faculty Approved</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filters.internshipId}
            onChange={(e) => setFilters({ ...filters, internshipId: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Internships</option>
            {internships.map(internship => (
              <option key={internship.id} value={internship.id}>
                {internship.title}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">Date Applied</option>
            <option value="updatedAt">Last Updated</option>
            <option value="studentName">Student Name</option>
            <option value="department">Department</option>
            <option value="cgpa">CGPA</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">
          Showing {filteredApplications.length} applications
        </p>
        <button
          onClick={() => {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          }}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <FontAwesomeIcon icon={sortOrder === 'asc' ? faSortUp : faSortDown} />
          <span>Sort</span>
        </button>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {currentItems.map((application) => (
          <div key={application.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.internshipTitle || 'Internship Title'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {application.companyName || 'Company Name'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getApprovalColor(application.facultyApproval)}`}>
                      Faculty: {application.facultyApproval}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FontAwesomeIcon icon={faUserGraduate} />
                    <span>{application.studentName || 'Student Name'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FontAwesomeIcon icon={faGraduationCap} />
                    <span>{application.department || 'Department'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FontAwesomeIcon icon={faStar} />
                    <span>CGPA: {application.cgpa || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>Applied: {formatDate(application.createdAt)}</span>
                  </div>
                </div>

                {application.coverLetter && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {application.coverLetter}
                  </p>
                )}

                {/* Eligibility Check */}
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon 
                      icon={application.cgpa >= 7.0 ? faCheckCircle : faTimesCircle} 
                      className={application.cgpa >= 7.0 ? 'text-green-600' : 'text-red-600'} 
                    />
                    <span>CGPA ≥ 7.0</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon 
                      icon={application.year === 'III' || application.year === 'IV' ? faCheckCircle : faTimesCircle} 
                      className={application.year === 'III' || application.year === 'IV' ? 'text-green-600' : 'text-red-600'} 
                    />
                    <span>Year III/IV</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon 
                      icon={application.resume ? faCheckCircle : faTimesCircle} 
                      className={application.resume ? 'text-green-600' : 'text-red-600'} 
                    />
                    <span>Resume Uploaded</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => {
                    setSelectedApplication(application);
                    setShowViewModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faEye} />
                </button>
                {application.facultyApproval === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        setApprovalData({
                          ...approvalData,
                          applicationId: application.id,
                          approvalStatus: 'approved'
                        });
                        setSelectedApplication(application);
                        setShowApprovalModal(true);
                      }}
                      className="p-2 text-green-400 hover:text-green-600"
                    >
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </button>
                    <button
                      onClick={() => {
                        setApprovalData({
                          ...approvalData,
                          applicationId: application.id,
                          approvalStatus: 'rejected'
                        });
                        setSelectedApplication(application);
                        setShowApprovalModal(true);
                      }}
                      className="p-2 text-red-400 hover:text-red-600"
                    >
                      <FontAwesomeIcon icon={faTimesCircle} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-2 border rounded-lg ${
                currentPage === index + 1
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {index + 1}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      )}

      {/* View Application Modal */}
      {showViewModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Application Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={faTimesCircle} className="text-xl" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedApplication.internshipTitle || 'Internship Title'}
                </h3>
                <p className="text-lg text-gray-600">
                  {selectedApplication.companyName || 'Company Name'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faUserGraduate} className="text-gray-400" />
                  <span className="text-sm">{selectedApplication.studentName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faGraduationCap} className="text-gray-400" />
                  <span className="text-sm">{selectedApplication.department}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faStar} className="text-gray-400" />
                  <span className="text-sm">CGPA: {selectedApplication.cgpa}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(selectedApplication.status)}`}>
                  Status: {selectedApplication.status}
                </span>
                <span className={`px-3 py-1 text-sm rounded-full ${getApprovalColor(selectedApplication.facultyApproval)}`}>
                  Faculty: {selectedApplication.facultyApproval}
                </span>
              </div>

              {selectedApplication.coverLetter && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Cover Letter</h4>
                  <p className="text-gray-600">{selectedApplication.coverLetter}</p>
                </div>
              )}

              {selectedApplication.sop && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Statement of Purpose</h4>
                  <p className="text-gray-600">{selectedApplication.sop}</p>
                </div>
              )}

              {selectedApplication.experience && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
                  <p className="text-gray-600">{selectedApplication.experience}</p>
                </div>
              )}

              {selectedApplication.projects && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Projects</h4>
                  <p className="text-gray-600">{selectedApplication.projects}</p>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedApplication.facultyApproval === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        setApprovalData({
                          ...approvalData,
                          applicationId: selectedApplication.id,
                          approvalStatus: 'rejected'
                        });
                        setShowApprovalModal(true);
                        setShowViewModal(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        setApprovalData({
                          ...approvalData,
                          applicationId: selectedApplication.id,
                          approvalStatus: 'approved'
                        });
                        setShowApprovalModal(true);
                        setShowViewModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {approvalData.approvalStatus === 'approved' ? 'Approve' : 'Reject'} Application
              </h2>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={faTimesCircle} className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleApproval} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments *
                </label>
                <textarea
                  required
                  rows={4}
                  value={approvalData.comments}
                  onChange={(e) => setApprovalData({ ...approvalData, comments: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Provide feedback for ${approvalData.approvalStatus === 'approved' ? 'approval' : 'rejection'}...`}
                />
              </div>

              {approvalData.approvalStatus === 'approved' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recommendations
                    </label>
                    <textarea
                      rows={3}
                      value={approvalData.recommendations}
                      onChange={(e) => setApprovalData({ ...approvalData, recommendations: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Any recommendations for the student..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conditions (if any)
                    </label>
                    <textarea
                      rows={2}
                      value={approvalData.conditions}
                      onChange={(e) => setApprovalData({ ...approvalData, conditions: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Any conditions for approval..."
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Steps
                </label>
                <textarea
                  rows={2}
                  value={approvalData.nextSteps}
                  onChange={(e) => setApprovalData({ ...approvalData, nextSteps: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What should the student do next..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-lg ${
                    approvalData.approvalStatus === 'approved'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {approvalData.approvalStatus === 'approved' ? 'Approve' : 'Reject'} Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyApproval;

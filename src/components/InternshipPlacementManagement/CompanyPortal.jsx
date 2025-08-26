import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding, faUserGraduate, faClock, faCheckCircle, faTimesCircle,
  faEye, faDownload, faUpload, faSearch, faFilter, faSort, faSortUp,
  faSortDown, faCalendarAlt, faMapMarkerAlt, faMoneyBillWave, faIndustry,
  faExclamationTriangle, faInfoCircle, faThumbsUp, faThumbsDown,
  faHourglassHalf, faArrowRight, faArrowLeft, faRefresh, faPrint,
  faShare, faEnvelope, faPhone, faFileAlt, faGraduationCap, faStar,
  faComments, faEdit, faTrash, faPlus, faCalendarCheck, faVideo,
  faUserCheck, faUserTimes, faUsers, faChartBar, faBell, faLink
} from '@fortawesome/free-solid-svg-icons';
import internshipPlacementService from './services/internshipPlacementService';

const CompanyPortal = ({ userRole }) => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showShortlistModal, setShowShortlistModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    companyResponse: 'pending',
    status: '',
    department: '',
    internshipId: '',
    shortlisted: false
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Interview scheduling form
  const [interviewData, setInterviewData] = useState({
    applicationId: '',
    interviewType: 'online', // online, onsite, phone
    scheduledDate: '',
    scheduledTime: '',
    duration: '60',
    location: '',
    meetingLink: '',
    instructions: '',
    interviewer: '',
    interviewerEmail: '',
    interviewerPhone: ''
  });

  // Shortlist form
  const [shortlistData, setShortlistData] = useState({
    applicationIds: [],
    shortlistReason: '',
    nextRound: '',
    additionalNotes: ''
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
        application.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.companyResponse) {
      filtered = filtered.filter(application => application.companyResponse === filters.companyResponse);
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
    if (filters.shortlisted) {
      filtered = filtered.filter(application => application.shortlisted === true);
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

  const handleInterviewScheduling = async (e) => {
    e.preventDefault();
    try {
      // Create interview record
      await internshipPlacementService.createRecruitmentRound({
        ...interviewData,
        type: 'interview',
        jobPostingId: selectedApplication.internshipId,
        participants: [selectedApplication.studentId],
        status: 'scheduled'
      });

      // Update application status
      await internshipPlacementService.updateApplicationStatus(
        interviewData.applicationId,
        'interview_scheduled',
        'company'
      );

      // Create notification for student
      await internshipPlacementService.createNotification({
        userId: selectedApplication.studentId,
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        message: `Your interview for ${selectedApplication.internshipTitle} has been scheduled.`,
        data: {
          applicationId: interviewData.applicationId,
          interviewDetails: interviewData
        }
      });

      setShowInterviewModal(false);
      setInterviewData({
        applicationId: '',
        interviewType: 'online',
        scheduledDate: '',
        scheduledTime: '',
        duration: '60',
        location: '',
        meetingLink: '',
        instructions: '',
        interviewer: '',
        interviewerEmail: '',
        interviewerPhone: ''
      });
      loadApplications();
    } catch (error) {
      console.error('Error scheduling interview:', error);
    }
  };

  const handleShortlist = async (e) => {
    e.preventDefault();
    try {
      // Update multiple applications
      await internshipPlacementService.bulkUpdateApplicationStatus(
        shortlistData.applicationIds,
        'shortlisted',
        'company'
      );

      // Create notifications for shortlisted students
      for (const applicationId of shortlistData.applicationIds) {
        const application = applications.find(app => app.id === applicationId);
        if (application) {
          await internshipPlacementService.createNotification({
            userId: application.studentId,
            type: 'shortlisted',
            title: 'Application Shortlisted',
            message: `Congratulations! Your application for ${application.internshipTitle} has been shortlisted.`,
            data: {
              applicationId,
              shortlistReason: shortlistData.shortlistReason,
              nextRound: shortlistData.nextRound
            }
          });
        }
      }

      setShowShortlistModal(false);
      setShortlistData({
        applicationIds: [],
        shortlistReason: '',
        nextRound: '',
        additionalNotes: ''
      });
      loadApplications();
    } catch (error) {
      console.error('Error shortlisting applications:', error);
    }
  };

  const handleApplicationResponse = async (applicationId, response) => {
    try {
      await internshipPlacementService.updateApplicationStatus(
        applicationId,
        response,
        'company'
      );

      const application = applications.find(app => app.id === applicationId);
      if (application) {
        await internshipPlacementService.createNotification({
          userId: application.studentId,
          type: 'company_response',
          title: `Application ${response === 'accepted' ? 'Accepted' : 'Rejected'}`,
          message: `Your application for ${application.internshipTitle} has been ${response === 'accepted' ? 'accepted' : 'rejected'}.`,
          data: {
            applicationId,
            response
          }
        });
      }

      loadApplications();
    } catch (error) {
      console.error('Error updating application response:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'faculty_approved':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-purple-100 text-purple-800';
      case 'interview_scheduled':
        return 'bg-indigo-100 text-indigo-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResponseColor = (response) => {
    switch (response) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
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
          <h1 className="text-2xl font-bold text-gray-900">Company Portal</h1>
          <p className="text-gray-600">
            Review applications and manage recruitment process
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
          <button
            onClick={() => setShowShortlistModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FontAwesomeIcon icon={faUserCheck} />
            <span>Shortlist Candidates</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">
                {applications.filter(app => app.companyResponse === 'pending').length}
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
              <p className="text-sm font-medium text-gray-600">Shortlisted</p>
              <p className="text-2xl font-bold text-purple-600">
                {applications.filter(app => app.shortlisted === true).length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FontAwesomeIcon icon={faUserCheck} className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-green-600">
                {applications.filter(app => app.companyResponse === 'accepted').length}
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

          {/* Company Response Filter */}
          <select
            value={filters.companyResponse}
            onChange={(e) => setFilters({ ...filters, companyResponse: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Responses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="faculty_approved">Faculty Approved</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview_scheduled">Interview Scheduled</option>
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

          <div className="flex items-center">
            <input
              type="checkbox"
              id="shortlisted"
              checked={filters.shortlisted}
              onChange={(e) => setFilters({ ...filters, shortlisted: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="shortlisted" className="text-sm text-gray-700">
              Shortlisted Only
            </label>
          </div>

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
                      {application.studentName} • {application.department}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getResponseColor(application.companyResponse)}`}>
                      Company: {application.companyResponse}
                    </span>
                    {application.shortlisted && (
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        Shortlisted
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FontAwesomeIcon icon={faUserGraduate} />
                    <span>{application.studentName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FontAwesomeIcon icon={faGraduationCap} />
                    <span>{application.department}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FontAwesomeIcon icon={faStar} />
                    <span>CGPA: {application.cgpa}</span>
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

                {/* Skills Match */}
                {application.skills && application.skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {application.skills.slice(0, 5).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {application.skills.length > 5 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          +{application.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
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
                {application.companyResponse === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        setInterviewData({
                          ...interviewData,
                          applicationId: application.id
                        });
                        setSelectedApplication(application);
                        setShowInterviewModal(true);
                      }}
                      className="p-2 text-blue-400 hover:text-blue-600"
                    >
                      <FontAwesomeIcon icon={faCalendarCheck} />
                    </button>
                    <button
                      onClick={() => handleApplicationResponse(application.id, 'accepted')}
                      className="p-2 text-green-400 hover:text-green-600"
                    >
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </button>
                    <button
                      onClick={() => handleApplicationResponse(application.id, 'rejected')}
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
                  {selectedApplication.studentName} • {selectedApplication.department}
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
                <span className={`px-3 py-1 text-sm rounded-full ${getResponseColor(selectedApplication.companyResponse)}`}>
                  Company: {selectedApplication.companyResponse}
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
                {selectedApplication.companyResponse === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        setInterviewData({
                          ...interviewData,
                          applicationId: selectedApplication.id
                        });
                        setShowInterviewModal(true);
                        setShowViewModal(false);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Schedule Interview
                    </button>
                    <button
                      onClick={() => handleApplicationResponse(selectedApplication.id, 'accepted')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleApplicationResponse(selectedApplication.id, 'rejected')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interview Scheduling Modal */}
      {showInterviewModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Schedule Interview</h2>
              <button
                onClick={() => setShowInterviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={faTimesCircle} className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleInterviewScheduling} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interview Type *
                  </label>
                  <select
                    required
                    value={interviewData.interviewType}
                    onChange={(e) => setInterviewData({ ...interviewData, interviewType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="online">Online</option>
                    <option value="onsite">Onsite</option>
                    <option value="phone">Phone</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <select
                    required
                    value={interviewData.duration}
                    onChange={(e) => setInterviewData({ ...interviewData, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={interviewData.scheduledDate}
                    onChange={(e) => setInterviewData({ ...interviewData, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={interviewData.scheduledTime}
                    onChange={(e) => setInterviewData({ ...interviewData, scheduledTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {interviewData.interviewType === 'online' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Link
                    </label>
                    <input
                      type="url"
                      value={interviewData.meetingLink}
                      onChange={(e) => setInterviewData({ ...interviewData, meetingLink: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                )}

                {interviewData.interviewType === 'onsite' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={interviewData.location}
                      onChange={(e) => setInterviewData({ ...interviewData, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Office address or meeting room"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions for Candidate
                </label>
                <textarea
                  rows={3}
                  value={interviewData.instructions}
                  onChange={(e) => setInterviewData({ ...interviewData, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any specific instructions for the candidate..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interviewer Name
                  </label>
                  <input
                    type="text"
                    value={interviewData.interviewer}
                    onChange={(e) => setInterviewData({ ...interviewData, interviewer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interviewer Email
                  </label>
                  <input
                    type="email"
                    value={interviewData.interviewerEmail}
                    onChange={(e) => setInterviewData({ ...interviewData, interviewerEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowInterviewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Schedule Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shortlist Modal */}
      {showShortlistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Shortlist Candidates</h2>
              <button
                onClick={() => setShowShortlistModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={faTimesCircle} className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleShortlist} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Candidates *
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-4">
                  {filteredApplications
                    .filter(app => app.companyResponse === 'pending')
                    .map(application => (
                      <label key={application.id} className="flex items-center space-x-3 py-2">
                        <input
                          type="checkbox"
                          checked={shortlistData.applicationIds.includes(application.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setShortlistData({
                                ...shortlistData,
                                applicationIds: [...shortlistData.applicationIds, application.id]
                              });
                            } else {
                              setShortlistData({
                                ...shortlistData,
                                applicationIds: shortlistData.applicationIds.filter(id => id !== application.id)
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {application.studentName} - {application.department} (CGPA: {application.cgpa})
                        </span>
                      </label>
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shortlist Reason
                </label>
                <textarea
                  rows={3}
                  value={shortlistData.shortlistReason}
                  onChange={(e) => setShortlistData({ ...shortlistData, shortlistReason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Why were these candidates shortlisted?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Round
                </label>
                <input
                  type="text"
                  value={shortlistData.nextRound}
                  onChange={(e) => setShortlistData({ ...shortlistData, nextRound: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Technical Interview, HR Round, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  rows={2}
                  value={shortlistData.additionalNotes}
                  onChange={(e) => setShortlistData({ ...shortlistData, additionalNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowShortlistModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={shortlistData.applicationIds.length === 0}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Shortlist Selected ({shortlistData.applicationIds.length})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyPortal;

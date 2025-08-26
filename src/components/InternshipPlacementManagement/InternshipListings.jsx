import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBriefcase, faBuilding, faMapMarkerAlt, faClock, faMoneyBillWave,
  faLaptop, faUserGraduate, faSearch, faFilter, faPlus, faEdit, faTrash,
  faEye, faCalendarAlt, faUsers, faStar, faCheckCircle, faTimesCircle,
  faExclamationTriangle, faArrowRight, faArrowLeft, faRefresh, faSort,
  faSortUp, faSortDown, faBookmark, faShare, faDownload, faPrint,
  faEnvelope, faPhone, faGlobe, faIndustry, faGraduationCap, faCode,
  faDatabase, faMobile, faCloud, faRobot, faShieldAlt, faLock,
  faUnlock, faEyeSlash, faHeart, faHeartBroken, faThumbsUp, faThumbsDown
} from '@fortawesome/free-solid-svg-icons';
import internshipPlacementService from './services/internshipPlacementService';

const InternshipListings = ({ userRole }) => {
  const [internships, setInternships] = useState([]);
  const [filteredInternships, setFilteredInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    domain: '',
    location: '',
    mode: '',
    minStipend: '',
    maxStipend: '',
    duration: '',
    status: 'active'
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form states for creating/editing internship
  const [formData, setFormData] = useState({
    title: '',
    companyId: '',
    companyName: '',
    description: '',
    domain: '',
    location: '',
    mode: 'onsite', // onsite, remote, hybrid
    stipend: '',
    duration: '',
    startDate: '',
    endDate: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    eligibleDepartments: [],
    eligibleYears: [],
    minCGPA: '',
    requiredSkills: [],
    maxApplications: '',
    applicationDeadline: '',
    contactEmail: '',
    contactPhone: ''
  });

  const domains = [
    'Software Development',
    'Data Science',
    'Machine Learning',
    'Web Development',
    'Mobile Development',
    'DevOps',
    'Cybersecurity',
    'Cloud Computing',
    'UI/UX Design',
    'Product Management',
    'Marketing',
    'Finance',
    'Human Resources',
    'Operations',
    'Research',
    'Other'
  ];

  const locations = [
    'Bangalore',
    'Mumbai',
    'Delhi',
    'Hyderabad',
    'Chennai',
    'Pune',
    'Kolkata',
    'Noida',
    'Gurgaon',
    'Remote',
    'Other'
  ];

  const departments = [
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
  ];

  const years = ['I', 'II', 'III', 'IV'];

  const skills = [
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Angular',
    'Vue.js', 'Django', 'Flask', 'Spring Boot', 'MySQL', 'MongoDB',
    'PostgreSQL', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git',
    'Machine Learning', 'Data Analysis', 'Tableau', 'Power BI',
    'Adobe Creative Suite', 'Figma', 'Sketch', 'Agile', 'Scrum'
  ];

  useEffect(() => {
    loadInternships();
  }, []);

  useEffect(() => {
    filterAndSortInternships();
  }, [internships, searchTerm, filters, sortBy, sortOrder]);

  const loadInternships = async () => {
    try {
      setLoading(true);
      const data = await internshipPlacementService.getInternships();
      setInternships(data);
    } catch (error) {
      console.error('Error loading internships:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortInternships = () => {
    let filtered = [...internships];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(internship =>
        internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.domain.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.domain) {
      filtered = filtered.filter(internship => internship.domain === filters.domain);
    }
    if (filters.location) {
      filtered = filtered.filter(internship => internship.location === filters.location);
    }
    if (filters.mode) {
      filtered = filtered.filter(internship => internship.mode === filters.mode);
    }
    if (filters.minStipend) {
      filtered = filtered.filter(internship => internship.stipend >= parseInt(filters.minStipend));
    }
    if (filters.maxStipend) {
      filtered = filtered.filter(internship => internship.stipend <= parseInt(filters.maxStipend));
    }
    if (filters.duration) {
      filtered = filtered.filter(internship => internship.duration === filters.duration);
    }
    if (filters.status) {
      filtered = filtered.filter(internship => internship.status === filters.status);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'stipend' || sortBy === 'applicationsCount') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredInternships(filtered);
  };

  const handleCreateInternship = async (e) => {
    e.preventDefault();
    try {
      await internshipPlacementService.createInternship(formData);
      setShowCreateModal(false);
      setFormData({
        title: '',
        companyId: '',
        companyName: '',
        description: '',
        domain: '',
        location: '',
        mode: 'onsite',
        stipend: '',
        duration: '',
        startDate: '',
        endDate: '',
        requirements: '',
        responsibilities: '',
        benefits: '',
        eligibleDepartments: [],
        eligibleYears: [],
        minCGPA: '',
        requiredSkills: [],
        maxApplications: '',
        applicationDeadline: '',
        contactEmail: '',
        contactPhone: ''
      });
      loadInternships();
    } catch (error) {
      console.error('Error creating internship:', error);
    }
  };

  const handleUpdateInternship = async (internshipId, updateData) => {
    try {
      await internshipPlacementService.updateInternship(internshipId, updateData);
      loadInternships();
    } catch (error) {
      console.error('Error updating internship:', error);
    }
  };

  const handleDeleteInternship = async (internshipId) => {
    if (window.confirm('Are you sure you want to delete this internship?')) {
      try {
        await internshipPlacementService.deleteInternship(internshipId);
        loadInternships();
      } catch (error) {
        console.error('Error deleting internship:', error);
      }
    }
  };

  const handleApplyForInternship = async (internshipId) => {
    // This would integrate with the application system
    console.log('Applying for internship:', internshipId);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'remote':
        return faLaptop;
      case 'hybrid':
        return faUsers;
      default:
        return faBuilding;
    }
  };

  const getModeColor = (mode) => {
    switch (mode) {
      case 'remote':
        return 'text-blue-600';
      case 'hybrid':
        return 'text-purple-600';
      default:
        return 'text-green-600';
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInternships.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInternships.length / itemsPerPage);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Internship Listings</h1>
          <p className="text-gray-600">
            Browse and manage internship opportunities
          </p>
        </div>
        {userRole === 'company' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Post Internship</span>
          </button>
        )}
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
                placeholder="Search internships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Domain Filter */}
          <select
            value={filters.domain}
            onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Domains</option>
            {domains.map(domain => (
              <option key={domain} value={domain}>{domain}</option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Locations</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        {/* Additional Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
          <select
            value={filters.mode}
            onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Modes</option>
            <option value="onsite">Onsite</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
          </select>

          <input
            type="number"
            placeholder="Min Stipend"
            value={filters.minStipend}
            onChange={(e) => setFilters({ ...filters, minStipend: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="number"
            placeholder="Max Stipend"
            value={filters.maxStipend}
            onChange={(e) => setFilters({ ...filters, maxStipend: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filters.duration}
            onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Durations</option>
            <option value="1-2 months">1-2 months</option>
            <option value="3-4 months">3-4 months</option>
            <option value="5-6 months">5-6 months</option>
            <option value="6+ months">6+ months</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">Date Posted</option>
            <option value="stipend">Stipend</option>
            <option value="applicationsCount">Applications</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">
          Showing {filteredInternships.length} internships
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

      {/* Internship Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((internship) => (
          <div key={internship.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {internship.title}
                  </h3>
                  <p className="text-sm text-gray-600">{internship.companyName}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(internship.status)}`}>
                    {internship.status}
                  </span>
                  {userRole === 'company' && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          setSelectedInternship(internship);
                          setShowViewModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        onClick={() => {
                          setFormData(internship);
                          setShowCreateModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleDeleteInternship(internship.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FontAwesomeIcon icon={faIndustry} />
                  <span>{internship.domain}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <span>{internship.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FontAwesomeIcon icon={getModeIcon(internship.mode)} className={getModeColor(internship.mode)} />
                  <span className="capitalize">{internship.mode}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FontAwesomeIcon icon={faMoneyBillWave} />
                  <span>{formatCurrency(internship.stipend)}/month</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FontAwesomeIcon icon={faClock} />
                  <span>{internship.duration}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FontAwesomeIcon icon={faUsers} />
                  <span>{internship.applicationsCount || 0} applications</span>
                </div>
              </div>

              {/* Description Preview */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {internship.description}
              </p>

              {/* Skills */}
              {internship.requiredSkills && internship.requiredSkills.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-700 mb-2">Required Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {internship.requiredSkills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {internship.requiredSkills.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        +{internship.requiredSkills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    setSelectedInternship(internship);
                    setShowViewModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Details →
                </button>
                {userRole === 'student' && (
                  <button
                    onClick={() => handleApplyForInternship(internship.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Apply Now
                  </button>
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

      {/* Create/Edit Internship Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {formData.id ? 'Edit Internship' : 'Post New Internship'}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={faTimesCircle} className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleCreateInternship} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internship Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domain *
                  </label>
                  <select
                    required
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Domain</option>
                    {domains.map(domain => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <select
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Location</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode *
                  </label>
                  <select
                    required
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="onsite">Onsite</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stipend (per month) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stipend}
                    onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration *
                  </label>
                  <select
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Duration</option>
                    <option value="1-2 months">1-2 months</option>
                    <option value="3-4 months">3-4 months</option>
                    <option value="5-6 months">5-6 months</option>
                    <option value="6+ months">6+ months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum CGPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.minCGPA}
                    onChange={(e) => setFormData({ ...formData, minCGPA: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Applications
                  </label>
                  <input
                    type="number"
                    value={formData.maxApplications}
                    onChange={(e) => setFormData({ ...formData, maxApplications: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements
                </label>
                <textarea
                  rows={3}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsibilities
                </label>
                <textarea
                  rows={3}
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benefits
                </label>
                <textarea
                  rows={3}
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eligible Departments
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {departments.map(dept => (
                      <label key={dept} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.eligibleDepartments.includes(dept)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                eligibleDepartments: [...formData.eligibleDepartments, dept]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                eligibleDepartments: formData.eligibleDepartments.filter(d => d !== dept)
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{dept}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eligible Years
                  </label>
                  <div className="space-y-2">
                    {years.map(year => (
                      <label key={year} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.eligibleYears.includes(year)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                eligibleYears: [...formData.eligibleYears, year]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                eligibleYears: formData.eligibleYears.filter(y => y !== year)
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{year} Year</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                  {skills.map(skill => (
                    <label key={skill} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.requiredSkills.includes(skill)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              requiredSkills: [...formData.requiredSkills, skill]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              requiredSkills: formData.requiredSkills.filter(s => s !== skill)
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {formData.id ? 'Update Internship' : 'Post Internship'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Internship Modal */}
      {showViewModal && selectedInternship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Internship Details</h2>
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
                  {selectedInternship.title}
                </h3>
                <p className="text-lg text-gray-600">{selectedInternship.companyName}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faIndustry} className="text-gray-400" />
                  <span className="text-sm">{selectedInternship.domain}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" />
                  <span className="text-sm">{selectedInternship.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={getModeIcon(selectedInternship.mode)} className="text-gray-400" />
                  <span className="text-sm capitalize">{selectedInternship.mode}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="text-gray-400" />
                  <span className="text-sm">{formatCurrency(selectedInternship.stipend)}/month</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                  <span className="text-sm">{selectedInternship.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faUsers} className="text-gray-400" />
                  <span className="text-sm">{selectedInternship.applicationsCount || 0} applications</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{selectedInternship.description}</p>
              </div>

              {selectedInternship.requirements && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                  <p className="text-gray-600">{selectedInternship.requirements}</p>
                </div>
              )}

              {selectedInternship.responsibilities && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Responsibilities</h4>
                  <p className="text-gray-600">{selectedInternship.responsibilities}</p>
                </div>
              )}

              {selectedInternship.benefits && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Benefits</h4>
                  <p className="text-gray-600">{selectedInternship.benefits}</p>
                </div>
              )}

              {selectedInternship.requiredSkills && selectedInternship.requiredSkills.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedInternship.requiredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {userRole === 'student' && (
                  <button
                    onClick={() => {
                      handleApplyForInternship(selectedInternship.id);
                      setShowViewModal(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipListings;

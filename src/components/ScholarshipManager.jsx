import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faEye,
  faDownload,
  faPrint,
  faCheckCircle,
  faClock,
  faExclamationTriangle,
  faUserGraduate,
  faPercentage,
  faMoneyBillWave,
  faFileInvoice,
  faGraduationCap,
  faAward,
  faHandshake,
  faUniversity,
  faLandmark,
  faBuilding,
  faCalendarAlt,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faCalculator,
  faChartBar,
  faFilter,
  faSearch
} from '@fortawesome/free-solid-svg-icons';

const ScholarshipManager = () => {
  const [scholarships, setScholarships] = useState([]);
  const [students, setStudents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data initialization
  useEffect(() => {
    setStudents([
      {
        id: 1,
        admissionNumber: '2024001',
        name: 'John Doe',
        program: 'B.Tech',
        department: 'Computer Science & Engineering',
        year: 'I',
        category: 'Regular',
        familyIncome: 800000,
        caste: 'General',
        state: 'Maharashtra',
        district: 'Mumbai'
      },
      {
        id: 2,
        admissionNumber: '2024002',
        name: 'Jane Smith',
        program: 'B.Tech',
        department: 'Electrical & Electronics Engineering',
        year: 'I',
        category: 'Scholarship',
        familyIncome: 450000,
        caste: 'OBC',
        state: 'Karnataka',
        district: 'Bangalore'
      },
      {
        id: 3,
        admissionNumber: '2024003',
        name: 'Mike Johnson',
        program: 'MBA',
        department: 'Management Studies',
        year: 'I',
        category: 'Management Quota',
        familyIncome: 1200000,
        caste: 'General',
        state: 'Tamil Nadu',
        district: 'Chennai'
      }
    ]);

    setScholarships([
      {
        id: 1,
        studentId: '2024001',
        studentName: 'John Doe',
        scholarshipType: 'Merit',
        scholarshipName: 'Merit Scholarship',
        amount: 25000,
        percentage: 25,
        academicYear: '2024-25',
        semester: 'I',
        status: 'approved',
        appliedDate: '2024-01-15',
        approvedDate: '2024-01-20',
        approvedBy: 'Dr. Smith',
        documents: ['Income Certificate', 'Caste Certificate', 'Marksheet'],
        remarks: 'Excellent academic performance',
        isActive: true,
        autoAdjustment: true,
        disbursementStatus: 'pending',
        disbursementDate: null
      },
      {
        id: 2,
        studentId: '2024002',
        studentName: 'Jane Smith',
        scholarshipType: 'Government',
        scholarshipName: 'NSP Scholarship',
        amount: 40000,
        percentage: 0,
        academicYear: '2024-25',
        semester: 'I',
        status: 'pending',
        appliedDate: '2024-01-10',
        approvedDate: null,
        approvedBy: null,
        documents: ['Income Certificate', 'Caste Certificate', 'Domicile Certificate'],
        remarks: 'Under review',
        isActive: true,
        autoAdjustment: false,
        disbursementStatus: 'not_applicable',
        disbursementDate: null
      },
      {
        id: 3,
        studentId: '2024003',
        studentName: 'Mike Johnson',
        scholarshipType: 'Institutional',
        scholarshipName: 'Staff Child Concession',
        amount: 30000,
        percentage: 20,
        academicYear: '2024-25',
        semester: 'I',
        status: 'approved',
        appliedDate: '2024-01-05',
        approvedDate: '2024-01-12',
        approvedBy: 'Dr. Johnson',
        documents: ['Staff ID Card', 'Birth Certificate'],
        remarks: 'Staff child concession applied',
        isActive: true,
        autoAdjustment: true,
        disbursementStatus: 'completed',
        disbursementDate: '2024-01-25'
      }
    ]);
  }, []);

  const getScholarshipTypeIcon = (type) => {
    switch (type) {
      case 'Merit': return faAward;
      case 'Government': return faLandmark;
      case 'Institutional': return faUniversity;
      case 'Private': return faBuilding;
      default: return faHandshake;
    }
  };

  const getScholarshipTypeColor = (type) => {
    switch (type) {
      case 'Merit': return 'bg-blue-100 text-blue-800';
      case 'Government': return 'bg-green-100 text-green-800';
      case 'Institutional': return 'bg-purple-100 text-purple-800';
      case 'Private': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return faCheckCircle;
      case 'pending': return faClock;
      case 'rejected': return faExclamationTriangle;
      case 'under_review': return faClock;
      default: return faClock;
    }
  };

  const getDisbursementStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'not_applicable': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredScholarships = scholarships.filter(scholarship => {
    const matchesSearch = scholarship.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scholarship.studentId.includes(searchTerm) ||
                         scholarship.scholarshipName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || scholarship.scholarshipType === filterType;
    const matchesStatus = filterStatus === 'all' || scholarship.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatistics = () => {
    const total = scholarships.length;
    const approved = scholarships.filter(s => s.status === 'approved').length;
    const pending = scholarships.filter(s => s.status === 'pending').length;
    const totalAmount = scholarships.reduce((sum, s) => sum + s.amount, 0);
    const disbursedAmount = scholarships
      .filter(s => s.disbursementStatus === 'completed')
      .reduce((sum, s) => sum + s.amount, 0);

    return { total, approved, pending, totalAmount, disbursedAmount };
  };

  const stats = getStatistics();

  const calculateFeeAdjustment = (scholarship) => {
    if (scholarship.autoAdjustment && scholarship.status === 'approved') {
      return scholarship.amount;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Scholarship & Concessions Manager</h1>
          <p className="text-gray-600 mt-2">Manage student scholarships, concessions, and fee adjustments</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FontAwesomeIcon icon={faAward} className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Scholarships</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FontAwesomeIcon icon={faClock} className="text-yellow-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FontAwesomeIcon icon={faMoneyBillWave} className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex space-x-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Add Scholarship</span>
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <FontAwesomeIcon icon={faDownload} />
                <span>Export Report</span>
              </button>
              <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <FontAwesomeIcon icon={faCalculator} />
                <span>Calculate Adjustments</span>
              </button>
            </div>

            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Search scholarships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="Merit">Merit</option>
                <option value="Government">Government</option>
                <option value="Institutional">Institutional</option>
                <option value="Private">Private</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="under_review">Under Review</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scholarships List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scholarship
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Academic Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disbursement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredScholarships.map((scholarship) => (
                  <tr key={scholarship.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{scholarship.studentName}</div>
                        <div className="text-sm text-gray-500">{scholarship.studentId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScholarshipTypeColor(scholarship.scholarshipType)}`}>
                          <FontAwesomeIcon icon={getScholarshipTypeIcon(scholarship.scholarshipType)} className="mr-1" />
                          {scholarship.scholarshipType}
                        </span>
                      </div>
                      <div className="text-sm text-gray-900 mt-1">{scholarship.scholarshipName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{scholarship.amount.toLocaleString()}</div>
                      {scholarship.percentage > 0 && (
                        <div className="text-sm text-gray-500">{scholarship.percentage}% of total fee</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {scholarship.academicYear} - Sem {scholarship.semester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(scholarship.status)}`}>
                        <FontAwesomeIcon icon={getStatusIcon(scholarship.status)} className="mr-1" />
                        {scholarship.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDisbursementStatusColor(scholarship.disbursementStatus)}`}>
                        {scholarship.disbursementStatus.replace('_', ' ')}
                      </span>
                      {scholarship.disbursementDate && (
                        <div className="text-xs text-gray-500 mt-1">{scholarship.disbursementDate}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedScholarship(scholarship);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button className="text-green-600 hover:text-green-900" title="Edit">
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button className="text-purple-600 hover:text-purple-900" title="Generate Certificate">
                          <FontAwesomeIcon icon={faFileInvoice} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Scholarship Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Add New Scholarship</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student *</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select Student</option>
                      {students.map(student => (
                        <option key={student.id} value={student.admissionNumber}>
                          {student.name} ({student.admissionNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scholarship Type *</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select Type</option>
                      <option value="Merit">Merit Scholarship</option>
                      <option value="Government">Government Scholarship</option>
                      <option value="Institutional">Institutional Scholarship</option>
                      <option value="Private">Private Scholarship</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scholarship Name *</label>
                  <input
                    type="text"
                    placeholder="Enter scholarship name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Percentage</label>
                    <input
                      type="number"
                      placeholder="Enter percentage"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year *</label>
                    <input
                      type="text"
                      placeholder="2024-25"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="I">I</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Required Documents</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Income Certificate
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Caste Certificate
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Domicile Certificate
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Marksheet
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                  <textarea
                    rows="3"
                    placeholder="Enter remarks"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm text-gray-700">Auto-adjustment of fees</span>
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Add Scholarship
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scholarship Details Modal */}
        {showDetailsModal && selectedScholarship && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Scholarship Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Student Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedScholarship.studentName}</p>
                    <p><span className="font-medium">ID:</span> {selectedScholarship.studentId}</p>
                    <p><span className="font-medium">Academic Year:</span> {selectedScholarship.academicYear}</p>
                    <p><span className="font-medium">Semester:</span> {selectedScholarship.semester}</p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Scholarship Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Type:</span> {selectedScholarship.scholarshipType}</p>
                    <p><span className="font-medium">Name:</span> {selectedScholarship.scholarshipName}</p>
                    <p><span className="font-medium">Amount:</span> ₹{selectedScholarship.amount.toLocaleString()}</p>
                    {selectedScholarship.percentage > 0 && (
                      <p><span className="font-medium">Percentage:</span> {selectedScholarship.percentage}%</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Status Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedScholarship.status)}`}>
                        <FontAwesomeIcon icon={getStatusIcon(selectedScholarship.status)} className="mr-1" />
                        {selectedScholarship.status}
                      </span>
                    </p>
                    <p><span className="font-medium">Applied Date:</span> {selectedScholarship.appliedDate}</p>
                    {selectedScholarship.approvedDate && (
                      <p><span className="font-medium">Approved Date:</span> {selectedScholarship.approvedDate}</p>
                    )}
                    {selectedScholarship.approvedBy && (
                      <p><span className="font-medium">Approved By:</span> {selectedScholarship.approvedBy}</p>
                    )}
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Disbursement Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDisbursementStatusColor(selectedScholarship.disbursementStatus)}`}>
                        {selectedScholarship.disbursementStatus.replace('_', ' ')}
                      </span>
                    </p>
                    {selectedScholarship.disbursementDate && (
                      <p><span className="font-medium">Disbursement Date:</span> {selectedScholarship.disbursementDate}</p>
                    )}
                    <p><span className="font-medium">Auto Adjustment:</span> {selectedScholarship.autoAdjustment ? 'Yes' : 'No'}</p>
                    {selectedScholarship.autoAdjustment && (
                      <p><span className="font-medium">Fee Adjustment:</span> ₹{calculateFeeAdjustment(selectedScholarship).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Required Documents</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedScholarship.documents.map((doc, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>

              {selectedScholarship.remarks && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Remarks</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedScholarship.remarks}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <FontAwesomeIcon icon={faEdit} className="mr-2" />
                  Edit Scholarship
                </button>
                <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  <FontAwesomeIcon icon={faFileInvoice} className="mr-2" />
                  Generate Certificate
                </button>
                <button className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                  <FontAwesomeIcon icon={faCalculator} className="mr-2" />
                  Calculate Adjustment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScholarshipManager;

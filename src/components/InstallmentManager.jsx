import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faBell,
  faExclamationTriangle,
  faCheckCircle,
  faClock,
  faPlus,
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faEye,
  faDownload,
  faPrint,
  faEnvelope,

  faMoneyBillWave,
  faCalculator,
  faFileInvoice,
  faUserGraduate,
  faCalendarCheck,
  faCalendarTimes
} from '@fortawesome/free-solid-svg-icons';

const InstallmentManager = () => {
  const [installments, setInstallments] = useState([]);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data initialization
  useEffect(() => {
    setInstallments([
      {
        id: 1,
        studentId: '2024001',
        studentName: 'John Doe',
        program: 'B.Tech',
        totalAmount: 150000,
        numberOfInstallments: 4,
        installmentAmount: 37500,
        startDate: '2024-01-15',
        dueDateType: 'monthly',
        lateFeePercentage: 5,
        gracePeriod: 7,
        status: 'active',
        installments: [
          {
            id: 1,
            installmentNumber: 1,
            dueDate: '2024-01-15',
            amount: 37500,
            status: 'paid',
            paidDate: '2024-01-14',
            paidAmount: 37500,
            lateFee: 0,
            receiptNumber: 'RCP001'
          },
          {
            id: 2,
            installmentNumber: 2,
            dueDate: '2024-02-15',
            amount: 37500,
            status: 'overdue',
            paidDate: null,
            paidAmount: 0,
            lateFee: 1875,
            receiptNumber: null
          },
          {
            id: 3,
            installmentNumber: 3,
            dueDate: '2024-03-15',
            amount: 37500,
            status: 'pending',
            paidDate: null,
            paidAmount: 0,
            lateFee: 0,
            receiptNumber: null
          },
          {
            id: 4,
            installmentNumber: 4,
            dueDate: '2024-04-15',
            amount: 37500,
            status: 'pending',
            paidDate: null,
            paidAmount: 0,
            lateFee: 0,
            receiptNumber: null
          }
        ],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15'
      },
      {
        id: 2,
        studentId: '2024002',
        studentName: 'Jane Smith',
        program: 'B.Tech',
        totalAmount: 120000,
        numberOfInstallments: 2,
        installmentAmount: 60000,
        startDate: '2024-01-20',
        dueDateType: 'semester',
        lateFeePercentage: 5,
        gracePeriod: 7,
        status: 'active',
        installments: [
          {
            id: 5,
            installmentNumber: 1,
            dueDate: '2024-01-20',
            amount: 60000,
            status: 'paid',
            paidDate: '2024-01-18',
            paidAmount: 60000,
            lateFee: 0,
            receiptNumber: 'RCP002'
          },
          {
            id: 6,
            installmentNumber: 2,
            dueDate: '2024-07-20',
            amount: 60000,
            status: 'pending',
            paidDate: null,
            paidAmount: 0,
            lateFee: 0,
            receiptNumber: null
          }
        ],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-18'
      }
    ]);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return faCheckCircle;
      case 'pending': return faClock;
      case 'overdue': return faExclamationTriangle;
      default: return faClock;
    }
  };

  const filteredInstallments = installments.filter(installment => {
    const matchesSearch = installment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         installment.studentId.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || installment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatistics = () => {
    const total = installments.length;
    const active = installments.filter(i => i.status === 'active').length;
    const overdue = installments.reduce((sum, i) => 
      sum + i.installments.filter(inst => inst.status === 'overdue').length, 0
    );
    const totalAmount = installments.reduce((sum, i) => sum + i.totalAmount, 0);
    const paidAmount = installments.reduce((sum, i) => 
      sum + i.installments.reduce((subSum, inst) => 
        subSum + (inst.status === 'paid' ? inst.paidAmount : 0), 0
      ), 0
    );

    return { total, active, overdue, totalAmount, paidAmount };
  };

  const stats = getStatistics();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Installment Manager</h1>
          <p className="text-gray-600 mt-2">Manage student fee installments, due dates, and reminders</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FontAwesomeIcon icon={faUserGraduate} className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
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
                <p className="text-sm font-medium text-gray-600">Active Plans</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FontAwesomeIcon icon={faMoneyBillWave} className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalAmount > 0 ? Math.round((stats.paidAmount / stats.totalAmount) * 100) : 0}%
                </p>
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
                <span>Add Installment Plan</span>
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <FontAwesomeIcon icon={faDownload} />
                <span>Export Report</span>
              </button>
            </div>

            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Installments List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Installments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInstallments.map((installment) => {
                  const paidInstallments = installment.installments.filter(i => i.status === 'paid').length;
                  const totalInstallments = installment.installments.length;
                  const progress = (paidInstallments / totalInstallments) * 100;
                  const overdueInstallments = installment.installments.filter(i => i.status === 'overdue').length;

                  return (
                    <tr key={installment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{installment.studentName}</div>
                          <div className="text-sm text-gray-500">{installment.studentId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {installment.program}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{installment.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {paidInstallments}/{totalInstallments}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{Math.round(progress)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(installment.status)}`}>
                            <FontAwesomeIcon icon={getStatusIcon(installment.status)} className="mr-1" />
                            {installment.status}
                          </span>
                          {overdueInstallments > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {overdueInstallments} overdue
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedInstallment(installment);
                              setShowDetailsModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button className="text-orange-600 hover:text-orange-900" title="Send Reminder">
                            <FontAwesomeIcon icon={faBell} />
                          </button>
                          <button className="text-green-600 hover:text-green-900" title="Generate Invoice">
                            <FontAwesomeIcon icon={faFileInvoice} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Installment Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Add Installment Plan</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student ID *</label>
                  <input
                    type="text"
                    placeholder="Enter student ID"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount *</label>
                  <input
                    type="number"
                    placeholder="Enter total amount"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Installments *</label>
                  <input
                    type="number"
                    placeholder="Enter number of installments"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                  <input
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date Type</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="monthly">Monthly</option>
                    <option value="semester">Semester-wise</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Create Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Installment Details Modal */}
        {showDetailsModal && selectedInstallment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Installment Details</h3>
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
                    <p><span className="font-medium">Name:</span> {selectedInstallment.studentName}</p>
                    <p><span className="font-medium">ID:</span> {selectedInstallment.studentId}</p>
                    <p><span className="font-medium">Program:</span> {selectedInstallment.program}</p>
                    <p><span className="font-medium">Total Amount:</span> ₹{selectedInstallment.totalAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Plan Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Installments:</span> {selectedInstallment.numberOfInstallments}</p>
                    <p><span className="font-medium">Amount per Installment:</span> ₹{selectedInstallment.installmentAmount.toLocaleString()}</p>
                    <p><span className="font-medium">Due Date Type:</span> {selectedInstallment.dueDateType}</p>
                    <p><span className="font-medium">Late Fee:</span> {selectedInstallment.lateFeePercentage}%</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Installment Schedule</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Installment</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Due Date</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Amount</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Late Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedInstallment.installments.map((installment) => (
                        <tr key={installment.id}>
                          <td className="px-4 py-2 text-sm">{installment.installmentNumber}</td>
                          <td className="px-4 py-2 text-sm">
                            <div className="flex items-center">
                              <FontAwesomeIcon icon={faCalendarAlt} className="mr-1 text-gray-400" />
                              {installment.dueDate}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm">₹{installment.amount.toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(installment.status)}`}>
                              <FontAwesomeIcon icon={getStatusIcon(installment.status)} className="mr-1" />
                              {installment.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {installment.status === 'overdue' ? `₹${installment.lateFee.toFixed(2)}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallmentManager;

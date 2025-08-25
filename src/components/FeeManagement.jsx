import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faDownload,
  faEye,
  faCheckCircle,
  faClock,
  faExclamationTriangle,
  faMoneyBillWave,
  faUserGraduate,
  faChartBar,
  faCalendarAlt,
  faCreditCard,
  faCalculator,
  faAward,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const FeeManagement = () => {
  const [feeStats, setFeeStats] = useState({
    totalStudents: 5,
    feePaid: 0,
    feePending: 5,
    feeOverdue: 0,
    collectionRate: 0.0
  });

  const [recentPayments, setRecentPayments] = useState([
    {
      id: 1,
      studentName: 'John Doe',
      rollNo: '23CS001',
      amount: 50000,
      date: '2024-01-15',
      status: 'paid'
    },
    {
      id: 2,
      studentName: 'Sarah Wilson',
      rollNo: '23EE002',
      amount: 45000,
      date: '2024-01-14',
      status: 'paid'
    },
    {
      id: 3,
      studentName: 'Michael Brown',
      rollNo: '23ME003',
      amount: 48000,
      date: '2024-01-13',
      status: 'pending'
    }
  ]);

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
              <p className="text-gray-600 mt-2">Comprehensive fee management system with advanced features</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <FontAwesomeIcon icon={faPlus} />
                <span>+ Add Payment</span>
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <FontAwesomeIcon icon={faDownload} />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Fee Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Fee Paid Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fee Paid</p>
                <p className="text-2xl font-bold text-gray-900">{feeStats.feePaid}</p>
                <p className="text-sm text-gray-500">
                  {feeStats.collectionRate}% of total
                </p>
              </div>
            </div>
          </div>

          {/* Fee Pending Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FontAwesomeIcon icon={faClock} className="text-yellow-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fee Pending</p>
                <p className="text-2xl font-bold text-gray-900">{feeStats.feePending}</p>
                <p className="text-sm text-gray-500">
                  {((feeStats.feePending / feeStats.totalStudents) * 100).toFixed(1)}% of total
                </p>
              </div>
            </div>
          </div>

          {/* Fee Overdue Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fee Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{feeStats.feeOverdue}</p>
                <p className="text-sm text-gray-500">
                  {((feeStats.feeOverdue / feeStats.totalStudents) * 100).toFixed(1)}% of total
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Fee Management Features */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Fee Management Features</h2>
          
          {/* Auto Fee Calculator */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FontAwesomeIcon icon={faCalculator} className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Auto Fee Calculator</h3>
                  <p className="text-gray-600">Automatic fee calculation based on course, category, hostel/transport, and scholarships</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">One-time Fees</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Recurring Fees</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Custom Charges</span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Invoice Generation</span>
                  </div>
                </div>
              </div>
              <Link to="/auto-fee-calculator" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <span>Open Calculator</span>
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
          </div>

          {/* Installment Manager */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-green-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Installment Manager</h3>
                  <p className="text-gray-600">Manage due dates, reminders, and late fee calculations</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Due Dates</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Reminders</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Late Fees</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Progress Tracking</span>
                  </div>
                </div>
              </div>
              <Link to="/installment-manager" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <span>Manage Installments</span>
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
          </div>

          {/* Scholarship Manager */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FontAwesomeIcon icon={faAward} className="text-purple-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Scholarship & Concessions Manager</h3>
                  <p className="text-gray-600">Comprehensive scholarship management with approval workflow</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Merit Scholarships</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Government Scholarships</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Staff Concessions</span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Auto Adjustment</span>
                  </div>
                </div>
              </div>
              <Link to="/scholarship-manager" className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <span>Manage Scholarships</span>
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
          </div>

          {/* Payment Manager */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FontAwesomeIcon icon={faCreditCard} className="text-orange-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Payment Manager</h3>
                  <p className="text-gray-600">Online/offline payments, reconciliation, and refund processing</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Payment Gateway</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Auto Reconciliation</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Split Payments</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Refund Processing</span>
                  </div>
                </div>
              </div>
              <Link to="/payment-manager" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <span>Manage Payments</span>
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
          </div>

          {/* Fee Reports */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <FontAwesomeIcon icon={faChartBar} className="text-indigo-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Fee Reports & Analytics</h3>
                  <p className="text-gray-600">Advanced analytics, reports, and trend analysis</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">Collection Reports</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Outstanding Reports</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Trend Analysis</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Export Capabilities</span>
                  </div>
                </div>
              </div>
              <Link to="/fee-reports" className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <span>View Reports</span>
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
          </div>
        </div>

        {/* Fee Collection Rate */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Fee Collection Rate</h3>
              <p className="text-sm text-gray-600">Overall collection progress</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${feeStats.collectionRate}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {feeStats.collectionRate}% Total Students
                </span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{feeStats.totalStudents}</p>
                <p className="text-sm text-gray-500">Total Students</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Recent Payments</h3>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1">
                <FontAwesomeIcon icon={faEye} />
                <span>View All</span>
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.studentName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.rollNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        <FontAwesomeIcon icon={getStatusIcon(payment.status)} className="mr-1" />
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FontAwesomeIcon icon={faUserGraduate} className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{feeStats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Collection</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(recentPayments.reduce((sum, p) => sum + (p.status === 'paid' ? p.amount : 0), 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FontAwesomeIcon icon={faChartBar} className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                <p className="text-2xl font-bold text-gray-900">{feeStats.collectionRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FontAwesomeIcon icon={faCreditCard} className="text-orange-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(recentPayments.reduce((sum, p) => sum + (p.status === 'pending' ? p.amount : 0), 0))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeManagement;

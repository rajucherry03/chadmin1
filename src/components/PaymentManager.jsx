import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faEye,
  faPrint,
  faDownload,
  faSearch,
  faFilter,
  faCalendarAlt,
  faCreditCard,
  faMoneyBillWave,
  faReceipt,
  faCheckCircle,
  faClock,
  faExclamationTriangle,
  faBell,
  faEnvelope,

  faCalculator,
  faHistory
} from '@fortawesome/free-solid-svg-icons';

const PaymentManager = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    paymentMethod: '',
    paymentDate: '',
    category: '',
    description: '',
    transactionId: '',
    receiptNumber: ''
  });

  // Mock data initialization
  useEffect(() => {
    setStudents([
      {
        id: '2024001',
        name: 'John Doe',
        department: 'Computer Science & Engineering',
        totalFee: 150000,
        paidAmount: 75000,
        pendingAmount: 75000
      },
      {
        id: '2024002',
        name: 'Jane Smith',
        department: 'Electrical & Electronics Engineering',
        totalFee: 120000,
        paidAmount: 120000,
        pendingAmount: 0
      }
    ]);

    setPayments([
      {
        id: 1,
        studentId: '2024001',
        studentName: 'John Doe',
        amount: 50000,
        paymentDate: '2024-01-15',
        paymentMethod: 'Online Transfer',
        transactionId: 'TXN001234',
        status: 'Completed',
        category: 'Tuition Fee',
        description: 'First installment payment',
        receiptNumber: 'RCP001',
        verifiedBy: 'Admin User',
        verifiedAt: '2024-01-15 10:30:00',
        installmentNumber: 1,
        totalInstallments: 3
      },
      {
        id: 2,
        studentId: '2024002',
        studentName: 'Jane Smith',
        amount: 120000,
        paymentDate: '2024-01-10',
        paymentMethod: 'Credit Card',
        transactionId: 'TXN001235',
        status: 'Completed',
        category: 'Full Payment',
        description: 'Complete fee payment',
        receiptNumber: 'RCP002',
        verifiedBy: 'Admin User',
        verifiedAt: '2024-01-10 14:20:00',
        installmentNumber: 1,
        totalInstallments: 1
      },
      {
        id: 3,
        studentId: '2024001',
        studentName: 'John Doe',
        amount: 25000,
        paymentDate: '2024-01-20',
        paymentMethod: 'Cash',
        transactionId: 'CASH001',
        status: 'Pending',
        category: 'Laboratory Fee',
        description: 'Lab fee payment',
        receiptNumber: 'RCP003',
        verifiedBy: null,
        verifiedAt: null,
        installmentNumber: 2,
        totalInstallments: 3
      }
    ]);
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status.toLowerCase() === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.paymentMethod.toLowerCase() === filterMethod;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method.toLowerCase()) {
      case 'online transfer': return faCreditCard;
      case 'credit card': return faCreditCard;
      case 'cash': return faMoneyBillWave;
      case 'cheque': return faReceipt;
      default: return faMoneyBillWave;
    }
  };

  const calculateStats = () => {
    const totalPayments = payments.length;
    const completedPayments = payments.filter(p => p.status === 'Completed').length;
    const pendingPayments = payments.filter(p => p.status === 'Pending').length;
    const failedPayments = payments.filter(p => p.status === 'Failed').length;
    
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const completedAmount = payments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);
    
    return {
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      totalAmount,
      completedAmount,
      pendingAmount,
      successRate: totalPayments > 0 ? ((completedPayments / totalPayments) * 100).toFixed(1) : 0
    };
  };

  const stats = calculateStats();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const student = students.find(s => s.id === formData.studentId);
    const newPayment = {
      id: Date.now(),
      studentId: formData.studentId,
      studentName: student ? student.name : '',
      amount: parseFloat(formData.amount),
      paymentDate: formData.paymentDate,
      paymentMethod: formData.paymentMethod,
      transactionId: formData.transactionId || `TXN${Date.now()}`,
      status: 'Pending',
      category: formData.category,
      description: formData.description,
      receiptNumber: formData.receiptNumber || `RCP${Date.now()}`,
      verifiedBy: null,
      verifiedAt: null,
      installmentNumber: 1,
      totalInstallments: 1
    };

    setPayments(prev => [...prev, newPayment]);
    setShowPaymentModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      amount: '',
      paymentMethod: '',
      paymentDate: '',
      category: '',
      description: '',
      transactionId: '',
      receiptNumber: ''
    });
  };

  const handleVerifyPayment = (paymentId) => {
    setPayments(prev => prev.map(p => 
      p.id === paymentId 
        ? { ...p, status: 'Completed', verifiedBy: 'Admin User', verifiedAt: new Date().toISOString() }
        : p
    ));
  };

  const handleRejectPayment = (paymentId) => {
    setPayments(prev => prev.map(p => 
      p.id === paymentId 
        ? { ...p, status: 'Failed', verifiedBy: 'Admin User', verifiedAt: new Date().toISOString() }
        : p
    ));
  };

  const generateReceipt = (payment) => {
    // Mock receipt generation
    const receiptContent = `
      RECEIPT
      Receipt No: ${payment.receiptNumber}
      Date: ${payment.paymentDate}
      Student: ${payment.studentName} (${payment.studentId})
      Amount: ₹${payment.amount.toLocaleString()}
      Method: ${payment.paymentMethod}
      Category: ${payment.category}
      Transaction ID: ${payment.transactionId}
      Status: ${payment.status}
    `;
    
    // In a real application, this would generate a PDF
    console.log('Receipt generated:', receiptContent);
    alert('Receipt generated successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Manager</h1>
          <p className="text-gray-600 mt-2">Manage student payments, track transactions, and generate receipts</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalPayments}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FontAwesomeIcon icon={faMoneyBillWave} className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completedPayments}</p>
                <p className="text-sm text-green-600">{stats.successRate}% success rate</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingPayments}</p>
                <p className="text-sm text-yellow-600">₹{stats.pendingAmount.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FontAwesomeIcon icon={faClock} className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.failedPayments}</p>
                <p className="text-sm text-red-600">Requires attention</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by student, ID, or transaction..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Methods</option>
                <option value="online transfer">Online Transfer</option>
                <option value="credit card">Credit Card</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
              </select>
              
              <button
                onClick={() => setShowPaymentModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Add Payment</span>
              </button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Student</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Amount</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Method</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Date</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Category</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-800">{payment.studentName}</p>
                        <p className="text-sm text-gray-600">ID: {payment.studentId}</p>
                        <p className="text-xs text-gray-500">Installment {payment.installmentNumber}/{payment.totalInstallments}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-800">₹{payment.amount.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={getPaymentMethodIcon(payment.paymentMethod)} className="text-gray-500" />
                        <span className="text-gray-600">{payment.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{payment.paymentDate}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{payment.category}</td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        {payment.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleVerifyPayment(payment.id)}
                              className="text-green-600 hover:text-green-800"
                              title="Verify Payment"
                            >
                              <FontAwesomeIcon icon={faCheckCircle} />
                            </button>
                            <button
                              onClick={() => handleRejectPayment(payment.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Reject Payment"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => generateReceipt(payment)}
                          className="text-purple-600 hover:text-purple-800"
                          title="Generate Receipt"
                        >
                          <FontAwesomeIcon icon={faPrint} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Details Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Payment Details</h3>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Student Information</h4>
                    <p className="text-gray-600">{selectedPayment.studentName}</p>
                    <p className="text-sm text-gray-500">ID: {selectedPayment.studentId}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Payment Amount</h4>
                    <p className="text-2xl font-bold text-gray-800">₹{selectedPayment.amount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Payment Method</h4>
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={getPaymentMethodIcon(selectedPayment.paymentMethod)} className="text-gray-500" />
                      <span className="text-gray-600">{selectedPayment.paymentMethod}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Status</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedPayment.status)}`}>
                      {selectedPayment.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Transaction ID</h4>
                    <p className="text-gray-600">{selectedPayment.transactionId}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Receipt Number</h4>
                    <p className="text-gray-600">{selectedPayment.receiptNumber}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedPayment.description}</p>
                </div>

                {selectedPayment.verifiedBy && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Verified By</h4>
                      <p className="text-gray-600">{selectedPayment.verifiedBy}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Verified At</h4>
                      <p className="text-gray-600">{selectedPayment.verifiedAt}</p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => generateReceipt(selectedPayment)}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <FontAwesomeIcon icon={faPrint} className="mr-2" />
                    Generate Receipt
                  </button>
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Add Payment</h3>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student *</label>
                  <select
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} - {student.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="Enter amount"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Method</option>
                    <option value="Online Transfer">Online Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date *</label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Tuition Fee">Tuition Fee</option>
                    <option value="Library Fee">Library Fee</option>
                    <option value="Laboratory Fee">Laboratory Fee</option>
                    <option value="Examination Fee">Examination Fee</option>
                    <option value="Other Charges">Other Charges</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter payment description"
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentManager;

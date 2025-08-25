import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDownload,
  faChartBar,
  faChartLine,
  faChartPie,
  faCalendarAlt,
  faFilter,
  faPrint,
  faEnvelope,
  faFileExcel,
  faFilePdf,
  faMoneyBillWave,
  faUsers,
  faCheckCircle,
  faClock,
  faExclamationTriangle,
  faArrowUp,
  faArrowDown,
  faEye,
  faSearch
} from '@fortawesome/free-solid-svg-icons';

const FeeReports = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [reportData, setReportData] = useState({});

  // Mock data initialization
  useEffect(() => {
    setReportData({
      overview: {
        totalStudents: 1250,
        totalFeeAmount: 187500000,
        totalCollected: 156250000,
        totalPending: 31250000,
        collectionRate: 83.33,
        monthlyGrowth: 12.5,
        departmentStats: [
          { name: 'Computer Science', students: 320, collected: 48000000, pending: 8000000 },
          { name: 'Electrical', students: 280, collected: 42000000, pending: 7000000 },
          { name: 'Mechanical', students: 250, collected: 37500000, pending: 6250000 },
          { name: 'Management', students: 200, collected: 30000000, pending: 5000000 },
          { name: 'Civil', students: 200, collected: 30000000, pending: 5000000 }
        ],
        monthlyData: [
          { month: 'Jan', collected: 12500000, pending: 2500000 },
          { month: 'Feb', collected: 13500000, pending: 2200000 },
          { month: 'Mar', collected: 14200000, pending: 2000000 },
          { month: 'Apr', collected: 14800000, pending: 1800000 },
          { month: 'May', collected: 15500000, pending: 1600000 },
          { month: 'Jun', collected: 16200000, pending: 1400000 }
        ],
        paymentMethods: [
          { method: 'Online Transfer', amount: 93750000, percentage: 60 },
          { method: 'Credit Card', amount: 46875000, percentage: 30 },
          { method: 'Cash', amount: 15625000, percentage: 10 }
        ]
      },
      detailed: {
        students: [
          {
            id: '2024001',
            name: 'John Doe',
            department: 'Computer Science',
            program: 'B.Tech',
            totalFee: 150000,
            paidAmount: 120000,
            pendingAmount: 30000,
            lastPayment: '2024-01-15',
            paymentStatus: 'Partial'
          },
          {
            id: '2024002',
            name: 'Jane Smith',
            department: 'Electrical',
            program: 'B.Tech',
            totalFee: 120000,
            paidAmount: 120000,
            pendingAmount: 0,
            lastPayment: '2024-01-10',
            paymentStatus: 'Paid'
          }
        ]
      }
    });
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const generateReport = (type) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `fee_report_${type}_${timestamp}`;
    
    // Mock report generation
    console.log(`Generating ${type} report: ${filename}`);
    alert(`${type} report generated successfully!`);
  };

  const sendReport = (type) => {
    alert(`${type} report sent to stakeholders!`);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{reportData.overview?.totalStudents?.toLocaleString()}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <FontAwesomeIcon icon={faArrowUp} className="mr-1" />
                8.5% from last month
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FontAwesomeIcon icon={faUsers} className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Collected</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(reportData.overview?.totalCollected)}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <FontAwesomeIcon icon={faArrowUp} className="mr-1" />
                {reportData.overview?.monthlyGrowth}% growth
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Amount</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(reportData.overview?.totalPending)}</p>
              <p className="text-sm text-yellow-600 flex items-center mt-1">
                <FontAwesomeIcon icon={faClock} className="mr-1" />
                Requires attention
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FontAwesomeIcon icon={faClock} className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Collection Rate</p>
              <p className="text-3xl font-bold text-gray-900">{reportData.overview?.collectionRate}%</p>
              <p className="text-sm text-purple-600 flex items-center mt-1">
                <FontAwesomeIcon icon={faChartBar} className="mr-1" />
                Target: 90%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FontAwesomeIcon icon={faChartBar} className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Collection Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Monthly Collection Trend</h3>
            <div className="flex space-x-2">
              <button className="text-blue-600 hover:text-blue-800">
                <FontAwesomeIcon icon={faDownload} />
              </button>
              <button className="text-green-600 hover:text-green-800">
                <FontAwesomeIcon icon={faPrint} />
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {reportData.overview?.monthlyData?.map((data, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-16 text-sm font-medium text-gray-600">{data.month}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-600">{formatCurrency(data.collected)}</span>
                    <span className="text-yellow-600">{formatCurrency(data.pending)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(data.collected / (data.collected + data.pending)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department-wise Collection */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Department-wise Collection</h3>
            <div className="flex space-x-2">
              <button className="text-blue-600 hover:text-blue-800">
                <FontAwesomeIcon icon={faDownload} />
              </button>
              <button className="text-green-600 hover:text-green-800">
                <FontAwesomeIcon icon={faPrint} />
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {reportData.overview?.departmentStats?.map((dept, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-24 text-sm font-medium text-gray-600 truncate">{dept.name}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-600">{formatCurrency(dept.collected)}</span>
                    <span className="text-yellow-600">{formatCurrency(dept.pending)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(dept.collected / (dept.collected + dept.pending)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-xs text-gray-500 text-right">
                  {dept.students} students
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Methods Distribution */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Payment Methods Distribution</h3>
          <div className="flex space-x-2">
            <button className="text-blue-600 hover:text-blue-800">
              <FontAwesomeIcon icon={faDownload} />
            </button>
            <button className="text-green-600 hover:text-green-800">
              <FontAwesomeIcon icon={faPrint} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reportData.overview?.paymentMethods?.map((method, index) => (
            <div key={index} className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                   style={{ backgroundColor: index === 0 ? '#3B82F6' : index === 1 ? '#10B981' : '#F59E0B' }}>
                {method.percentage}%
              </div>
              <h4 className="font-medium text-gray-800 mb-2">{method.method}</h4>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(method.amount)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDetailed = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex space-x-4">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical">Electrical</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Management">Management</option>
              <option value="Civil">Civil</option>
            </select>
            
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Programs</option>
              <option value="B.Tech">B.Tech</option>
              <option value="MBA">MBA</option>
              <option value="M.Tech">M.Tech</option>
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => generateReport('detailed')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FontAwesomeIcon icon={faDownload} />
              <span>Export Report</span>
            </button>
            <button
              onClick={() => sendReport('detailed')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FontAwesomeIcon icon={faEnvelope} />
              <span>Send Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Student</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Department</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Program</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Total Fee</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Paid</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Pending</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Last Payment</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reportData.detailed?.students?.map((student) => (
                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-800">{student.name}</p>
                      <p className="text-sm text-gray-600">ID: {student.id}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{student.department}</td>
                  <td className="py-4 px-6 text-gray-600">{student.program}</td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-800">{formatCurrency(student.totalFee)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-green-600">{formatCurrency(student.paidAmount)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-red-600">{formatCurrency(student.pendingAmount)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.paymentStatus === 'Paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {student.paymentStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{student.lastPayment}</td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800" title="View Details">
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button className="text-green-600 hover:text-green-800" title="Generate Receipt">
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
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Collection Efficiency</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{reportData.overview?.collectionRate}%</div>
            <p className="text-gray-600">Overall collection rate</p>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{ width: `${reportData.overview?.collectionRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Growth Rate</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{reportData.overview?.monthlyGrowth}%</div>
            <p className="text-gray-600">Monthly growth</p>
            <div className="mt-4 flex items-center justify-center text-green-600">
              <FontAwesomeIcon icon={faArrowUp} className="mr-1" />
              <span>Positive trend</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Average Payment</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {formatCurrency(reportData.overview?.totalCollected / reportData.overview?.totalStudents)}
            </div>
            <p className="text-gray-600">Per student</p>
          </div>
        </div>
      </div>

      {/* Advanced Analytics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Advanced Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Payment Trends</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Online Payments</span>
                <span className="font-medium">60%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Card Payments</span>
                <span className="font-medium">30%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cash Payments</span>
                <span className="font-medium">10%</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Department Performance</h4>
            <div className="space-y-3">
              {reportData.overview?.departmentStats?.slice(0, 3).map((dept, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{dept.name}</span>
                  <span className="font-medium">
                    {((dept.collected / (dept.collected + dept.pending)) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Fee Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive reports and analytics for fee management insights</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: faChartBar },
                { id: 'detailed', name: 'Detailed Report', icon: faFileExcel },
                { id: 'analytics', name: 'Analytics', icon: faChartLine }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'detailed' && renderDetailed()}
          {activeTab === 'analytics' && renderAnalytics()}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => generateReport('summary')}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
            >
              <div className="text-center">
                <FontAwesomeIcon icon={faFilePdf} className="text-blue-500 text-2xl mb-2" />
                <p className="font-medium text-blue-800">Summary Report</p>
                <p className="text-sm text-blue-600">PDF format</p>
              </div>
            </button>
            
            <button
              onClick={() => generateReport('detailed')}
              className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors"
            >
              <div className="text-center">
                <FontAwesomeIcon icon={faFileExcel} className="text-green-500 text-2xl mb-2" />
                <p className="font-medium text-green-800">Detailed Report</p>
                <p className="text-sm text-green-600">Excel format</p>
              </div>
            </button>
            
            <button
              onClick={() => sendReport('monthly')}
              className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors"
            >
              <div className="text-center">
                <FontAwesomeIcon icon={faEnvelope} className="text-purple-500 text-2xl mb-2" />
                <p className="font-medium text-purple-800">Email Report</p>
                <p className="text-sm text-purple-600">Send to stakeholders</p>
              </div>
            </button>
            
            <button
              onClick={() => generateReport('analytics')}
              className="bg-orange-50 border border-orange-200 rounded-lg p-4 hover:bg-orange-100 transition-colors"
            >
              <div className="text-center">
                <FontAwesomeIcon icon={faChartBar} className="text-orange-500 text-2xl mb-2" />
                <p className="font-medium text-orange-800">Analytics Report</p>
                <p className="text-sm text-orange-600">Charts & insights</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeReports;

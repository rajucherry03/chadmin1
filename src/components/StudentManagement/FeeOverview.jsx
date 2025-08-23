import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBillWave,
  faCheckCircle,
  faClock,
  faExclamationTriangle,
  faChartBar,
  faDownload,
  faPlus
} from "@fortawesome/free-solid-svg-icons";

const FeeOverview = ({ stats }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("current");

  const feeData = {
    paid: stats?.paid || 0,
    pending: stats?.pending || 0,
    overdue: stats?.overdue || 0
  };

  const totalStudents = feeData.paid + feeData.pending + feeData.overdue;
  const collectionRate = totalStudents > 0 ? ((feeData.paid / totalStudents) * 100).toFixed(1) : 0;

  const feeCards = [
    {
      title: "Fee Paid",
      value: feeData.paid,
      icon: faCheckCircle,
      color: "bg-green-50 border-green-200",
      textColor: "text-green-800",
      iconColor: "text-green-500"
    },
    {
      title: "Fee Pending",
      value: feeData.pending,
      icon: faClock,
      color: "bg-yellow-50 border-yellow-200",
      textColor: "text-yellow-800",
      iconColor: "text-yellow-500"
    },
    {
      title: "Fee Overdue",
      value: feeData.overdue,
      icon: faExclamationTriangle,
      color: "bg-red-50 border-red-200",
      textColor: "text-red-800",
      iconColor: "text-red-500"
    }
  ];

  const recentPayments = [
    {
      id: 1,
      studentName: "John Doe",
      rollNo: "23CS001",
      amount: 50000,
      date: "2024-01-15",
      status: "paid"
    },
    {
      id: 2,
      studentName: "Sarah Wilson",
      rollNo: "23EE002",
      amount: 45000,
      date: "2024-01-14",
      status: "paid"
    },
    {
      id: 3,
      studentName: "Michael Brown",
      rollNo: "23ME003",
      amount: 48000,
      date: "2024-01-13",
      status: "pending"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Fee Management</h2>
          <p className="text-gray-600">Manage student fee payments and collections</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <FontAwesomeIcon icon={faPlus} />
            <span>Add Payment</span>
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <FontAwesomeIcon icon={faDownload} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Fee Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {feeCards.map((card, index) => (
          <div key={index} className={`${card.color} border rounded-xl p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {totalStudents > 0 ? `${((card.value / totalStudents) * 100).toFixed(1)}%` : '0%'} of total
                </p>
              </div>
              <div className={`p-3 rounded-full bg-white shadow-sm`}>
                <FontAwesomeIcon icon={card.icon} className={`text-2xl ${card.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Collection Rate */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Fee Collection Rate</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Collection Progress</span>
              <span className="text-lg font-bold text-green-600">{collectionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${collectionRate}%` }}
              ></div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Students</p>
            <p className="text-2xl font-bold text-gray-800">{totalStudents}</p>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Payments</h3>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Student</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Roll No</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-800">{payment.studentName}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{payment.rollNo}</td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-800">₹{payment.amount.toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{payment.date}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      payment.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors">
          <div className="text-center">
            <FontAwesomeIcon icon={faMoneyBillWave} className="text-blue-500 text-2xl mb-2" />
            <p className="font-medium text-blue-800">Send Reminders</p>
            <p className="text-sm text-blue-600">Notify pending payments</p>
          </div>
        </button>
        
        <button className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors">
          <div className="text-center">
            <FontAwesomeIcon icon={faChartBar} className="text-green-500 text-2xl mb-2" />
            <p className="font-medium text-green-800">Generate Reports</p>
            <p className="text-sm text-green-600">Fee collection reports</p>
          </div>
        </button>
        
        <button className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors">
          <div className="text-center">
            <FontAwesomeIcon icon={faDownload} className="text-purple-500 text-2xl mb-2" />
            <p className="font-medium text-purple-800">Export Data</p>
            <p className="text-sm text-purple-600">Download fee records</p>
          </div>
        </button>
        
        <button className="bg-orange-50 border border-orange-200 rounded-lg p-4 hover:bg-orange-100 transition-colors">
          <div className="text-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-orange-500 text-2xl mb-2" />
            <p className="font-medium text-orange-800">Overdue Alerts</p>
            <p className="text-sm text-orange-600">View overdue payments</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default FeeOverview;

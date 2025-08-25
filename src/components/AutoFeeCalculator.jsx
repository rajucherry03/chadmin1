import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalculator,
  faPlus,
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faEye,
  faDownload,
  faPrint,
  faFileInvoice,
  faCalendarAlt,
  faMoneyBillWave,
  faHome,
  faBus,
  faGraduationCap,
  faUserGraduate,
  faPercentage,
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

const AutoFeeCalculator = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeCalculation, setFeeCalculation] = useState(null);
  const [showCalculationModal, setShowCalculationModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedCalculation, setSelectedCalculation] = useState(null);

  // Mock data for demonstration
  const [students] = useState([
    {
      id: 1,
      admissionNumber: '2024001',
      name: 'John Doe',
      program: 'B.Tech',
      department: 'Computer Science & Engineering',
      year: 'I',
      category: 'Regular',
      hostelRequired: true,
      transportRequired: false,
      scholarshipType: null,
      scholarshipPercentage: 0
    },
    {
      id: 2,
      admissionNumber: '2024002',
      name: 'Jane Smith',
      program: 'B.Tech',
      department: 'Electrical & Electronics Engineering',
      year: 'I',
      category: 'Scholarship',
      hostelRequired: false,
      transportRequired: true,
      scholarshipType: 'Merit',
      scholarshipPercentage: 25
    },
    {
      id: 3,
      admissionNumber: '2024003',
      name: 'Mike Johnson',
      program: 'MBA',
      department: 'Management Studies',
      year: 'I',
      category: 'Management Quota',
      hostelRequired: true,
      transportRequired: true,
      scholarshipType: null,
      scholarshipPercentage: 0
    }
  ]);

  const [feeStructures] = useState({
    'B.Tech': {
      baseTuition: 100000,
      libraryFee: 5000,
      laboratoryFee: 15000,
      examinationFee: 10000,
      otherCharges: 20000
    },
    'MBA': {
      baseTuition: 150000,
      libraryFee: 8000,
      laboratoryFee: 5000,
      examinationFee: 12000,
      otherCharges: 25000
    }
  });

  const [additionalCharges] = useState({
    hostel: {
      singleRoom: 60000,
      doubleRoom: 45000,
      tripleRoom: 35000
    },
    transport: {
      local: 25000,
      interCity: 40000
    },
    oneTimeFees: {
      admissionFee: 10000,
      cautionDeposit: 15000,
      idCardFee: 500,
      uniformFee: 3000,
      prospectusFee: 1000
    },
    customCharges: {
      examFee: 2000,
      revaluationFee: 1000,
      latePaymentFine: 500,
      idCardReplacement: 200
    }
  });

  const [installmentPlans] = useState([
    {
      id: 1,
      name: 'Full Payment',
      installments: 1,
      discount: 5,
      dueDate: 'Admission Date'
    },
    {
      id: 2,
      name: 'Semester-wise',
      installments: 2,
      discount: 0,
      dueDate: 'Semester Start'
    },
    {
      id: 3,
      name: 'Monthly',
      installments: 10,
      discount: 0,
      dueDate: 'Monthly'
    }
  ]);

  const calculateFees = (student) => {
    const baseStructure = feeStructures[student.program];
    if (!baseStructure) return null;

    let totalFees = 0;
    let breakdown = {
      baseFees: {},
      additionalFees: {},
      discounts: {},
      total: 0
    };

    // Base Fees Calculation
    breakdown.baseFees = {
      tuitionFee: baseStructure.baseTuition,
      libraryFee: baseStructure.libraryFee,
      laboratoryFee: baseStructure.laboratoryFee,
      examinationFee: baseStructure.examinationFee,
      otherCharges: baseStructure.otherCharges
    };

    // Category-based adjustments
    if (student.category === 'Scholarship') {
      breakdown.baseFees.tuitionFee *= 0.8; // 20% discount
    } else if (student.category === 'Management Quota') {
      breakdown.baseFees.tuitionFee *= 1.3; // 30% premium
    }

    // Additional Scholarship
    if (student.scholarshipType && student.scholarshipPercentage > 0) {
      const scholarshipAmount = (breakdown.baseFees.tuitionFee * student.scholarshipPercentage) / 100;
      breakdown.discounts.scholarship = scholarshipAmount;
      breakdown.baseFees.tuitionFee -= scholarshipAmount;
    }

    // Hostel Fees
    if (student.hostelRequired) {
      breakdown.additionalFees.hostel = additionalCharges.hostel.doubleRoom;
    }

    // Transport Fees
    if (student.transportRequired) {
      breakdown.additionalFees.transport = additionalCharges.transport.local;
    }

    // One-time Fees
    breakdown.additionalFees.oneTimeFees = {
      admissionFee: additionalCharges.oneTimeFees.admissionFee,
      cautionDeposit: additionalCharges.oneTimeFees.cautionDeposit,
      idCardFee: additionalCharges.oneTimeFees.idCardFee,
      uniformFee: additionalCharges.oneTimeFees.uniformFee,
      prospectusFee: additionalCharges.oneTimeFees.prospectusFee
    };

    // Calculate totals
    const baseTotal = Object.values(breakdown.baseFees).reduce((sum, fee) => sum + fee, 0);
    const additionalTotal = Object.values(breakdown.additionalFees).reduce((sum, fee) => {
      if (typeof fee === 'object') {
        return sum + Object.values(fee).reduce((subSum, subFee) => subSum + subFee, 0);
      }
      return sum + fee;
    }, 0);
    const discountTotal = Object.values(breakdown.discounts).reduce((sum, discount) => sum + discount, 0);

    totalFees = baseTotal + additionalTotal - discountTotal;
    breakdown.total = totalFees;

    return {
      student,
      breakdown,
      totalFees,
      calculatedAt: new Date().toISOString(),
      installmentOptions: generateInstallmentOptions(totalFees)
    };
  };

  const generateInstallmentOptions = (totalAmount) => {
    return installmentPlans.map(plan => {
      const installmentAmount = totalAmount / plan.installments;
      const discountAmount = (totalAmount * plan.discount) / 100;
      const finalAmount = totalAmount - discountAmount;
      const finalInstallmentAmount = finalAmount / plan.installments;

      return {
        ...plan,
        originalAmount: totalAmount,
        discountAmount,
        finalAmount,
        installmentAmount: finalInstallmentAmount,
        dueDates: generateDueDates(plan.installments, plan.dueDate)
      };
    });
  };

  const generateDueDates = (installments, dueDateType) => {
    const dates = [];
    const currentDate = new Date();
    
    for (let i = 0; i < installments; i++) {
      let dueDate;
      if (dueDateType === 'Admission Date') {
        dueDate = new Date(currentDate);
      } else if (dueDateType === 'Semester Start') {
        dueDate = new Date(currentDate);
        dueDate.setMonth(currentDate.getMonth() + (i * 6));
      } else if (dueDateType === 'Monthly') {
        dueDate = new Date(currentDate);
        dueDate.setMonth(currentDate.getMonth() + i);
      }
      dates.push(dueDate.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const handleCalculateFees = (student) => {
    const calculation = calculateFees(student);
    setFeeCalculation(calculation);
    setShowCalculationModal(true);
  };

  const generateInvoice = (calculation) => {
    setSelectedCalculation(calculation);
    setShowInvoiceModal(true);
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
          <h1 className="text-3xl font-bold text-gray-900">Auto Fee Calculator</h1>
          <p className="text-gray-600 mt-2">Automatically calculate fees based on course, category, hostel/transport, and scholarships</p>
        </div>

        {/* Student Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Student for Fee Calculation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <div key={student.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{student.name}</h3>
                    <p className="text-sm text-gray-600">{student.admissionNumber}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    student.category === 'Regular' ? 'bg-blue-100 text-blue-800' :
                    student.category === 'Scholarship' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {student.category}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <p>{student.program} - {student.department}</p>
                  <p>Year: {student.year}</p>
                  {student.scholarshipType && (
                    <p className="text-green-600">
                      <FontAwesomeIcon icon={faPercentage} className="mr-1" />
                      {student.scholarshipPercentage}% {student.scholarshipType} Scholarship
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {student.hostelRequired && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded flex items-center">
                      <FontAwesomeIcon icon={faHome} className="mr-1" />
                      Hostel
                    </span>
                  )}
                  {student.transportRequired && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded flex items-center">
                      <FontAwesomeIcon icon={faBus} className="mr-1" />
                      Transport
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleCalculateFees(student)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <FontAwesomeIcon icon={faCalculator} />
                  <span>Calculate Fees</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Fee Calculation Modal */}
        {showCalculationModal && feeCalculation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Fee Calculation Result</h3>
                <button
                  onClick={() => setShowCalculationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Student Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {feeCalculation.student.name}</p>
                    <p><span className="font-medium">Admission No:</span> {feeCalculation.student.admissionNumber}</p>
                    <p><span className="font-medium">Program:</span> {feeCalculation.student.program}</p>
                    <p><span className="font-medium">Department:</span> {feeCalculation.student.department}</p>
                    <p><span className="font-medium">Category:</span> {feeCalculation.student.category}</p>
                    {feeCalculation.student.scholarshipType && (
                      <p><span className="font-medium">Scholarship:</span> {feeCalculation.student.scholarshipPercentage}% {feeCalculation.student.scholarshipType}</p>
                    )}
                  </div>
                </div>

                {/* Total Amount */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Total Fee Amount</h4>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {formatCurrency(feeCalculation.totalFees)}
                    </div>
                    <p className="text-sm text-gray-600">Calculated on {new Date(feeCalculation.calculatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 mb-3">Detailed Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Base Fees */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2 flex items-center">
                      <FontAwesomeIcon icon={faGraduationCap} className="mr-2 text-blue-500" />
                      Base Fees
                    </h5>
                    <div className="space-y-1 text-sm">
                      {Object.entries(feeCalculation.breakdown.baseFees).map(([key, amount]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="font-medium">{formatCurrency(amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Fees */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2 flex items-center">
                      <FontAwesomeIcon icon={faPlus} className="mr-2 text-green-500" />
                      Additional Fees
                    </h5>
                    <div className="space-y-1 text-sm">
                      {Object.entries(feeCalculation.breakdown.additionalFees).map(([key, amount]) => {
                        if (typeof amount === 'object') {
                          return Object.entries(amount).map(([subKey, subAmount]) => (
                            <div key={`${key}-${subKey}`} className="flex justify-between">
                              <span className="capitalize">{subKey.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <span className="font-medium">{formatCurrency(subAmount)}</span>
                            </div>
                          ));
                        }
                        return (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className="font-medium">{formatCurrency(amount)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Discounts */}
                {Object.keys(feeCalculation.breakdown.discounts).length > 0 && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2 flex items-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-500" />
                      Discounts Applied
                    </h5>
                    <div className="space-y-1 text-sm">
                      {Object.entries(feeCalculation.breakdown.discounts).map(([key, amount]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="font-medium text-green-600">-{formatCurrency(amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Installment Options */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 mb-3">Installment Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {feeCalculation.installmentOptions.map((option) => (
                    <div key={option.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-800 mb-2">{option.name}</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Installments:</span>
                          <span className="font-medium">{option.installments}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Amount per Installment:</span>
                          <span className="font-medium">{formatCurrency(option.installmentAmount)}</span>
                        </div>
                        {option.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount:</span>
                            <span className="font-medium">{option.discount}%</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold">
                          <span>Final Amount:</span>
                          <span>{formatCurrency(option.finalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => generateInvoice(feeCalculation)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <FontAwesomeIcon icon={faFileInvoice} />
                  <span>Generate Invoice</span>
                </button>
                <button
                  onClick={() => setShowCalculationModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Modal */}
        {showInvoiceModal && selectedCalculation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Fee Invoice</h3>
                <div className="flex space-x-2">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center space-x-1">
                    <FontAwesomeIcon icon={faPrint} />
                    <span>Print</span>
                  </button>
                  <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center space-x-1">
                    <FontAwesomeIcon icon={faDownload} />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => setShowInvoiceModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </div>

              {/* Invoice Content */}
              <div className="border border-gray-200 rounded-lg p-6">
                {/* Header */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">UNIVERSITY FEE INVOICE</h2>
                  <p className="text-gray-600">Academic Year 2024-25</p>
                </div>

                {/* Student Details */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Student Details</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Name:</span> {selectedCalculation.student.name}</p>
                      <p><span className="font-medium">Admission No:</span> {selectedCalculation.student.admissionNumber}</p>
                      <p><span className="font-medium">Program:</span> {selectedCalculation.student.program}</p>
                      <p><span className="font-medium">Department:</span> {selectedCalculation.student.department}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Invoice Details</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Invoice Date:</span> {new Date().toLocaleDateString()}</p>
                      <p><span className="font-medium">Due Date:</span> {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                      <p><span className="font-medium">Category:</span> {selectedCalculation.student.category}</p>
                    </div>
                  </div>
                </div>

                {/* Fee Breakdown Table */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Fee Breakdown</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {Object.entries(selectedCalculation.breakdown.baseFees).map(([key, amount]) => (
                          <tr key={key}>
                            <td className="px-4 py-2 text-sm">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                            <td className="px-4 py-2 text-sm text-right font-medium">{formatCurrency(amount)}</td>
                          </tr>
                        ))}
                        {Object.entries(selectedCalculation.breakdown.additionalFees).map(([key, amount]) => {
                          if (typeof amount === 'object') {
                            return Object.entries(amount).map(([subKey, subAmount]) => (
                              <tr key={`${key}-${subKey}`}>
                                <td className="px-4 py-2 text-sm">{subKey.replace(/([A-Z])/g, ' $1').trim()}</td>
                                <td className="px-4 py-2 text-sm text-right font-medium">{formatCurrency(subAmount)}</td>
                              </tr>
                            ));
                          }
                          return (
                            <tr key={key}>
                              <td className="px-4 py-2 text-sm">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                              <td className="px-4 py-2 text-sm text-right font-medium">{formatCurrency(amount)}</td>
                            </tr>
                          );
                        })}
                        {Object.entries(selectedCalculation.breakdown.discounts).map(([key, amount]) => (
                          <tr key={key} className="bg-green-50">
                            <td className="px-4 py-2 text-sm text-green-700">{key.replace(/([A-Z])/g, ' $1').trim()} (Discount)</td>
                            <td className="px-4 py-2 text-sm text-right font-medium text-green-700">-{formatCurrency(amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td className="px-4 py-3 text-sm font-semibold">Total Amount</td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-lg">{formatCurrency(selectedCalculation.totalFees)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Payment Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Payment Instructions</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>• Payment can be made online through the student portal</p>
                    <p>• Bank transfer details will be provided separately</p>
                    <p>• Late payment will incur additional charges</p>
                    <p>• For any queries, contact the accounts department</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoFeeCalculator;

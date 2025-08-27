import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBillWave,
  faCalculator,
  faFileInvoice,
  faFileInvoiceDollar,
  faDownload,
  faPlus,
  faEdit,
  faEye,
  faTrash,
  faUserTie,
  faUserCog,
  faUserShield,
  faUserSecret,
  faUserTag,
  faUserLock,
  faUnlock,
  faUserSlash,
  faUserCheck,
  faUserEdit,
  faUserMinus,
  faUserPlus,
  faUserTimes,
  faUserClock,
  faUserGraduate
} from "@fortawesome/free-solid-svg-icons";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";

const PayrollFinance = () => {
  const [activeTab, setActiveTab] = useState("salary-structure");
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [taxCalculations, setTaxCalculations] = useState([]);
  const [financialReports, setFinancialReports] = useState([]);

  useEffect(() => {
    // Fetch salary structures
    const unsubscribeSalaryStructures = onSnapshot(
      collection(db, "salaryStructures"),
      (snapshot) => {
        const structures = [];
        snapshot.forEach((doc) => {
          structures.push({ id: doc.id, ...doc.data() });
        });
        setSalaryStructures(structures);
      }
    );

    // Fetch payslips
    const unsubscribePayslips = onSnapshot(
      collection(db, "payslips"),
      (snapshot) => {
        const payslipData = [];
        snapshot.forEach((doc) => {
          payslipData.push({ id: doc.id, ...doc.data() });
        });
        setPayslips(payslipData);
      }
    );

    // Fetch tax calculations
    const unsubscribeTaxCalculations = onSnapshot(
      collection(db, "taxCalculations"),
      (snapshot) => {
        const taxData = [];
        snapshot.forEach((doc) => {
          taxData.push({ id: doc.id, ...doc.data() });
        });
        setTaxCalculations(taxData);
      }
    );

    // Fetch financial reports
    const unsubscribeFinancialReports = onSnapshot(
      collection(db, "financialReports"),
      (snapshot) => {
        const reports = [];
        snapshot.forEach((doc) => {
          reports.push({ id: doc.id, ...doc.data() });
        });
        setFinancialReports(reports);
      }
    );

    return () => {
      unsubscribeSalaryStructures();
      unsubscribePayslips();
      unsubscribeTaxCalculations();
      unsubscribeFinancialReports();
    };
  }, []);

  const tabs = [
    { id: "salary-structure", name: "Salary Structure", icon: faMoneyBillWave, count: salaryStructures.length },
    { id: "payslips", name: "Payslips", icon: faFileInvoiceDollar, count: payslips.length },
    { id: "tax-calculations", name: "Tax Calculations", icon: faCalculator, count: taxCalculations.length },
    { id: "financial-reports", name: "Financial Reports", icon: faDownload, count: financialReports.length }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "salary-structure":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Salary Structure</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Structure
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {salaryStructures.map((structure) => (
                <div key={structure.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{structure.designation}</h4>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {structure.department}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Basic Pay:</strong> ₹{structure.basicPay}</p>
                    <p><strong>DA:</strong> ₹{structure.da}</p>
                    <p><strong>HRA:</strong> ₹{structure.hra}</p>
                    <p><strong>Allowances:</strong> ₹{structure.allowances}</p>
                    <p><strong>Total:</strong> ₹{structure.totalSalary}</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "payslips":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Monthly Payslips</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Basic Pay</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allowances</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Pay</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payslips.map((payslip) => (
                    <tr key={payslip.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payslip.facultyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payslip.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{payslip.basicPay}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{payslip.allowances}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{payslip.deductions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{payslip.netPay}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <FontAwesomeIcon icon={faDownload} />
                          </button>
                          <button className="text-yellow-600 hover:text-yellow-900">
                            <FontAwesomeIcon icon={faFileInvoiceDollar} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "tax-calculations":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tax Calculations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {taxCalculations.map((tax) => (
                <div key={tax.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{tax.facultyName}</h4>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      FY {tax.financialYear}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Gross Income:</strong> ₹{tax.grossIncome}</p>
                    <p><strong>Exemptions:</strong> ₹{tax.exemptions}</p>
                    <p><strong>Taxable Income:</strong> ₹{tax.taxableIncome}</p>
                    <p><strong>Tax Amount:</strong> ₹{tax.taxAmount}</p>
                    <p><strong>Net Income:</strong> ₹{tax.netIncome}</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <FontAwesomeIcon icon={faCalculator} />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-900">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "financial-reports":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Financial Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {financialReports.map((report) => (
                <div key={report.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{report.reportName}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      report.type === "Monthly" ? "bg-blue-100 text-blue-800" :
                      report.type === "Quarterly" ? "bg-green-100 text-green-800" :
                      "bg-purple-100 text-purple-800"
                    }`}>
                      {report.type}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Period:</strong> {report.period}</p>
                    <p><strong>Total Salary:</strong> ₹{report.totalSalary}</p>
                    <p><strong>Total Tax:</strong> ₹{report.totalTax}</p>
                    <p><strong>Net Payroll:</strong> ₹{report.netPayroll}</p>
                    <p><strong>Generated:</strong> {report.generatedAt?.toDate().toLocaleDateString()}</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-900">
                      <FontAwesomeIcon icon={faFileInvoiceDollar} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payroll & Finance</h2>
          <p className="text-gray-600">Manage faculty salary, payroll processing, and financial reports</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} />
                <span>{tab.name}</span>
                <span className="bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default PayrollFinance;

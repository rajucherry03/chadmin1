import React, { useState, useEffect } from "react";
import studentApiService from '../../services/studentApiService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldAlt,
  faIdCard,
  faFileAlt,
  faCertificate,
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

const ComplianceAccreditation = () => {
  const [activeTab, setActiveTab] = useState("compliance-data");
  const [complianceData, setComplianceData] = useState([]);
  const [facultyIds, setFacultyIds] = useState([]);
  const [serviceRecords, setServiceRecords] = useState([]);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    // Fetch compliance data
    const unsubscribeCompliance = onSnapshot(
      collection(db, "complianceData"),
      (snapshot) => {
        const data = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setComplianceData(data);
      }
    );

    // Fetch faculty IDs
    const unsubscribeFacultyIds = onSnapshot(
      collection(db, "facultyIds"),
      (snapshot) => {
        const ids = [];
        snapshot.forEach((doc) => {
          ids.push({ id: doc.id, ...doc.data() });
        });
        setFacultyIds(ids);
      }
    );

    // Fetch service records
    const unsubscribeServiceRecords = onSnapshot(
      collection(db, "serviceRecords"),
      (snapshot) => {
        const records = [];
        snapshot.forEach((doc) => {
          records.push({ id: doc.id, ...doc.data() });
        });
        setServiceRecords(records);
      }
    );

    // Fetch documents
    const unsubscribeDocuments = onSnapshot(
      collection(db, "accreditationDocuments"),
      (snapshot) => {
        const docs = [];
        snapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        setDocuments(docs);
      }
    );

    return () => {
      unsubscribeCompliance();
      unsubscribeFacultyIds();
      unsubscribeServiceRecords();
      unsubscribeDocuments();
    };
  }, []);

  const tabs = [
    { id: "compliance-data", name: "Compliance Data", icon: faShieldAlt, count: complianceData.length },
    { id: "faculty-ids", name: "Faculty IDs", icon: faIdCard, count: facultyIds.length },
    { id: "service-records", name: "Service Records", icon: faFileAlt, count: serviceRecords.length },
    { id: "documents", name: "Document Archive", icon: faCertificate, count: documents.length }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "compliance-data":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">AICTE/UGC Compliance Data</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Compliance Data
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {complianceData.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{item.department}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      item.complianceStatus === "Compliant" ? "bg-green-100 text-green-800" :
                      item.complianceStatus === "Non-Compliant" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {item.complianceStatus}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Faculty-Student Ratio:</strong> {item.facultyStudentRatio}</p>
                    <p><strong>Required Faculty:</strong> {item.requiredFaculty}</p>
                    <p><strong>Available Faculty:</strong> {item.availableFaculty}</p>
                    <p><strong>Qualified Faculty:</strong> {item.qualifiedFaculty}</p>
                    <p><strong>Last Updated:</strong> {item.lastUpdated}</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-900">
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "faculty-ids":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Faculty ID Verification</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AICTE ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PAN</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aadhaar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {facultyIds.map((faculty) => (
                    <tr key={faculty.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {faculty.facultyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {faculty.aicteId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {faculty.panNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {faculty.aadhaarNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          faculty.verificationStatus === "Verified" ? "bg-green-100 text-green-800" :
                          faculty.verificationStatus === "Pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {faculty.verificationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button className="text-yellow-600 hover:text-yellow-900">
                            <FontAwesomeIcon icon={faIdCard} />
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

      case "service-records":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Service Records</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceRecords.map((record) => (
                <div key={record.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{record.facultyName}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      record.status === "Active" ? "bg-green-100 text-green-800" :
                      record.status === "Retired" ? "bg-blue-100 text-blue-800" :
                      record.status === "Resigned" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {record.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Joining Date:</strong> {record.joiningDate}</p>
                    <p><strong>Confirmation Date:</strong> {record.confirmationDate}</p>
                    <p><strong>Last Promotion:</strong> {record.lastPromotion}</p>
                    <p><strong>Total Service:</strong> {record.totalService} years</p>
                    <p><strong>Department:</strong> {record.department}</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-900">
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "documents":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Document Archive</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Upload Document
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{doc.documentName}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      doc.category === "AICTE" ? "bg-blue-100 text-blue-800" :
                      doc.category === "UGC" ? "bg-green-100 text-green-800" :
                      doc.category === "NAAC" ? "bg-purple-100 text-purple-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {doc.category}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Type:</strong> {doc.documentType}</p>
                    <p><strong>Uploaded:</strong> {doc.uploadedAt?.toDate().toLocaleDateString()}</p>
                    <p><strong>Size:</strong> {doc.fileSize}</p>
                    <p><strong>Status:</strong> {doc.status}</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-900">
                      <FontAwesomeIcon icon={faCertificate} />
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
          <h2 className="text-2xl font-bold text-gray-900">Compliance & Accreditation</h2>
          <p className="text-gray-600">Manage AICTE/UGC compliance, faculty verification, and accreditation documents</p>
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

export default ComplianceAccreditation;

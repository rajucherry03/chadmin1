import React, { useState, useEffect } from "react";
import studentApiService from '../../services/studentApiService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFlask,
  faUserGraduate,
  faFileAlt,
  faProjectDiagram,
  faHandshake,
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
  faUserClock
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

const ResearchDevelopment = () => {
  const [activeTab, setActiveTab] = useState("publications");
  const [publications, setPublications] = useState([]);
  const [researchProjects, setResearchProjects] = useState([]);
  const [consultancy, setConsultancy] = useState([]);
  const [phdSupervision, setPhdSupervision] = useState([]);

  useEffect(() => {
    // Fetch publications
    const unsubscribePublications = onSnapshot(
      collection(db, "publications"),
      (snapshot) => {
        const pubData = [];
        snapshot.forEach((doc) => {
          pubData.push({ id: doc.id, ...doc.data() });
        });
        setPublications(pubData);
      }
    );

    // Fetch research projects
    const unsubscribeResearchProjects = onSnapshot(
      collection(db, "researchProjects"),
      (snapshot) => {
        const projects = [];
        snapshot.forEach((doc) => {
          projects.push({ id: doc.id, ...doc.data() });
        });
        setResearchProjects(projects);
      }
    );

    // Fetch consultancy
    const unsubscribeConsultancy = onSnapshot(
      collection(db, "consultancy"),
      (snapshot) => {
        const consultancyData = [];
        snapshot.forEach((doc) => {
          consultancyData.push({ id: doc.id, ...doc.data() });
        });
        setConsultancy(consultancyData);
      }
    );

    // Fetch PhD supervision
    const unsubscribePhdSupervision = onSnapshot(
      collection(db, "phdSupervision"),
      (snapshot) => {
        const phdData = [];
        snapshot.forEach((doc) => {
          phdData.push({ id: doc.id, ...doc.data() });
        });
        setPhdSupervision(phdData);
      }
    );

    return () => {
      unsubscribePublications();
      unsubscribeResearchProjects();
      unsubscribeConsultancy();
      unsubscribePhdSupervision();
    };
  }, []);

  const tabs = [
    { id: "publications", name: "Publications", icon: faFileAlt, count: publications.length },
    { id: "research-projects", name: "Research Projects", icon: faProjectDiagram, count: researchProjects.length },
    { id: "consultancy", name: "Consultancy", icon: faHandshake, count: consultancy.length },
    { id: "phd-supervision", name: "PhD Supervision", icon: faUserGraduate, count: phdSupervision.length }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "publications":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Publications Repository</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Publication
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publications.map((publication) => (
                <div key={publication.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{publication.title}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      publication.type === "Journal" ? "bg-blue-100 text-blue-800" :
                      publication.type === "Conference" ? "bg-green-100 text-green-800" :
                      publication.type === "Book" ? "bg-purple-100 text-purple-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {publication.type}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Authors:</strong> {publication.authors}</p>
                    <p><strong>Journal/Conference:</strong> {publication.journal}</p>
                    <p><strong>Year:</strong> {publication.year}</p>
                    <p><strong>Impact Factor:</strong> {publication.impactFactor}</p>
                    <p><strong>Citations:</strong> {publication.citations}</p>
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

      case "research-projects":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Research Projects</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Project
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {researchProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{project.title}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      project.status === "Ongoing" ? "bg-green-100 text-green-800" :
                      project.status === "Completed" ? "bg-blue-100 text-blue-800" :
                      project.status === "Proposed" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>PI:</strong> {project.principalInvestigator}</p>
                    <p><strong>Funding Agency:</strong> {project.fundingAgency}</p>
                    <p><strong>Amount:</strong> ₹{project.amount}</p>
                    <p><strong>Duration:</strong> {project.duration}</p>
                    <p><strong>Team Size:</strong> {project.teamSize} members</p>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {project.progress}% completed
                    </p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-900">
                      <FontAwesomeIcon icon={faProjectDiagram} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "consultancy":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Consultancy & Industry Collaboration</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Consultancy
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {consultancy.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{item.projectTitle}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      item.status === "Active" ? "bg-green-100 text-green-800" :
                      item.status === "Completed" ? "bg-blue-100 text-blue-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Client:</strong> {item.clientName}</p>
                    <p><strong>Faculty:</strong> {item.facultyName}</p>
                    <p><strong>Value:</strong> ₹{item.projectValue}</p>
                    <p><strong>Duration:</strong> {item.duration}</p>
                    <p><strong>Type:</strong> {item.consultancyType}</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-900">
                      <FontAwesomeIcon icon={faHandshake} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "phd-supervision":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">PhD Supervision</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Scholar
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scholar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supervisor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Topic</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {phdSupervision.map((scholar) => (
                    <tr key={scholar.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {scholar.scholarName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {scholar.supervisorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {scholar.researchTopic}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          scholar.status === "Coursework" ? "bg-blue-100 text-blue-800" :
                          scholar.status === "Research" ? "bg-green-100 text-green-800" :
                          scholar.status === "Thesis" ? "bg-yellow-100 text-yellow-800" :
                          scholar.status === "Completed" ? "bg-purple-100 text-purple-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {scholar.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${scholar.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{scholar.progress}%</span>
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
                            <FontAwesomeIcon icon={faUserGraduate} />
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

      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Research & Development</h2>
          <p className="text-gray-600">Manage research publications, projects, consultancy, and PhD supervision</p>
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

export default ResearchDevelopment;

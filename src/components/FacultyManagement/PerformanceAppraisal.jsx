import React, { useState, useEffect } from "react";
import studentApiService from '../../services/studentApiService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faStar,
  faComments,
  faFileAlt,
  faAward,
  faCalculator,
  faDownload,
  faPlus,
  faEdit,
  faEye,
  faTrash,
  faCheckCircle,
  faTimes,
  faUserGraduate,
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

const PerformanceAppraisal = () => {
  const [activeTab, setActiveTab] = useState("self-appraisal");
  const [selfAppraisals, setSelfAppraisals] = useState([]);
  const [peerReviews, setPeerReviews] = useState([]);
  const [researchContributions, setResearchContributions] = useState([]);
  const [awards, setAwards] = useState([]);
  const [apiScores, setApiScores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    // Fetch self appraisals
    const unsubscribeSelfAppraisals = onSnapshot(
      collection(db, "selfAppraisals"),
      (snapshot) => {
        const appraisals = [];
        snapshot.forEach((doc) => {
          appraisals.push({ id: doc.id, ...doc.data() });
        });
        setSelfAppraisals(appraisals);
      }
    );

    // Fetch peer reviews
    const unsubscribePeerReviews = onSnapshot(
      collection(db, "peerReviews"),
      (snapshot) => {
        const reviews = [];
        snapshot.forEach((doc) => {
          reviews.push({ id: doc.id, ...doc.data() });
        });
        setPeerReviews(reviews);
      }
    );

    // Fetch research contributions
    const unsubscribeResearch = onSnapshot(
      collection(db, "researchContributions"),
      (snapshot) => {
        const research = [];
        snapshot.forEach((doc) => {
          research.push({ id: doc.id, ...doc.data() });
        });
        setResearchContributions(research);
      }
    );

    // Fetch awards
    const unsubscribeAwards = onSnapshot(
      collection(db, "awards"),
      (snapshot) => {
        const awardData = [];
        snapshot.forEach((doc) => {
          awardData.push({ id: doc.id, ...doc.data() });
        });
        setAwards(awardData);
      }
    );

    // Fetch API scores
    const unsubscribeApiScores = onSnapshot(
      collection(db, "apiScores"),
      (snapshot) => {
        const scores = [];
        snapshot.forEach((doc) => {
          scores.push({ id: doc.id, ...doc.data() });
        });
        setApiScores(scores);
      }
    );

    return () => {
      unsubscribeSelfAppraisals();
      unsubscribePeerReviews();
      unsubscribeResearch();
      unsubscribeAwards();
      unsubscribeApiScores();
    };
  }, []);

  const tabs = [
    { id: "self-appraisal", name: "Self Appraisal", icon: faFileAlt, count: selfAppraisals.length },
    { id: "peer-review", name: "Peer Review", icon: faComments, count: peerReviews.length },
    { id: "research", name: "Research", icon: faUserGraduate, count: researchContributions.length },
    { id: "awards", name: "Awards", icon: faAward, count: awards.length },
    { id: "api-scores", name: "API Scores", icon: faCalculator, count: apiScores.length }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "self-appraisal":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Self Appraisal</h3>
              <button
                onClick={() => {
                  setModalType("self-appraisal");
                  setShowModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Appraisal
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selfAppraisals.map((appraisal) => (
                <div key={appraisal.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{appraisal.facultyName}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      appraisal.status === "Submitted" ? "bg-green-100 text-green-800" :
                      appraisal.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {appraisal.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Period:</strong> {appraisal.period}</p>
                    <p><strong>Department:</strong> {appraisal.department}</p>
                    <p><strong>Score:</strong> {appraisal.score}/100</p>
                    <p><strong>Submitted:</strong> {appraisal.submittedAt?.toDate().toLocaleDateString()}</p>
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

      case "peer-review":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Peer Review</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviewer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {peerReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {review.facultyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {review.reviewerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {review.score}/100
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          review.status === "Completed" ? "bg-green-100 text-green-800" :
                          review.status === "In Progress" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {review.status}
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "research":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Research Contributions</h3>
              <button
                onClick={() => {
                  setModalType("research");
                  setShowModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Research
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {researchContributions.map((research) => (
                <div key={research.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{research.title}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      research.type === "Publication" ? "bg-blue-100 text-blue-800" :
                      research.type === "Patent" ? "bg-green-100 text-green-800" :
                      research.type === "Project" ? "bg-purple-100 text-purple-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {research.type}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Faculty:</strong> {research.facultyName}</p>
                    <p><strong>Year:</strong> {research.year}</p>
                    <p><strong>Impact Factor:</strong> {research.impactFactor}</p>
                    <p><strong>Citations:</strong> {research.citations}</p>
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

      case "awards":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Awards & Recognitions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {awards.map((award) => (
                <div key={award.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{award.title}</h4>
                    <FontAwesomeIcon icon={faAward} className="text-yellow-500 text-xl" />
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Faculty:</strong> {award.facultyName}</p>
                    <p><strong>Year:</strong> {award.year}</p>
                    <p><strong>Category:</strong> {award.category}</p>
                    <p><strong>Organization:</strong> {award.organization}</p>
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

      case "api-scores":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">API Score Calculation</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">API Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {apiScores.map((score) => (
                    <tr key={score.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {score.facultyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {score.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {score.apiScore}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          score.apiScore >= 75 ? "bg-green-100 text-green-800" :
                          score.apiScore >= 50 ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {score.apiScore >= 75 ? "Excellent" :
                           score.apiScore >= 50 ? "Good" : "Needs Improvement"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <FontAwesomeIcon icon={faCalculator} />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <FontAwesomeIcon icon={faDownload} />
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
          <h2 className="text-2xl font-bold text-gray-900">Performance & Appraisal</h2>
          <p className="text-gray-600">Manage faculty performance evaluation and appraisal system</p>
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

export default PerformanceAppraisal;

import React, { useState, useEffect } from "react";
import studentApiService from '../services/studentApiService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faSearch,
  faFilter,
  faSort,
  faEdit,
  faTrash,
  faEye,
  faCheck,
  faTimes,
  faClock,
  faCalendarAlt,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faGraduationCap,
  faBriefcase,
  faFileAlt,
  faDownload,
  faUpload,
  faPlus,
  faSave,
  faUser,
  faUniversity,
  faAward,
  faStar,
  faCheckCircle,
  faExclamationTriangle,
  faHourglassHalf,
  faCalendarCheck,
  faCalendarTimes,
  faUserCheck,
  faUserTimes,
  faUserClock,
  faUserGraduate,
  faUserTie,
  faUserShield,
  faUserSecret,
  faUserTag,
  faUserLock,
  faUserSlash,
  faEllipsis,
  faSortUp,
  faSortDown,
  faList,
  faThLarge,
  faBell,
  faCog,
  faHistory,
  faSync,
  faPrint,
  faShare,
  faLink,
  faUnlink,
  faUserEdit,
  faUserMinus,
  faUnlock,
  faBars,
  faHome,
  faDashboard,
  faCalendar,
  faTasks,
  faFileText,
  faCog as faSettings,
  faSignOutAlt,
  faBell as faNotification,
  faChevronDown,
  faChevronRight,
  faMedal,
  faTrophy,
  faCertificate,
  faBookOpen,
  faLaptop,
  faMicroscope,
  faLightbulb,
  faRocket,
  faBullseye,
  faArrowUp,
  faChartPie,
  faTable,
  faListUl,
  faEllipsisVertical,
  faClose,
  faUndo,
  faRedo,
  faCopy,
  faPaste,
  faCut,
  faBold,
  faItalic,
  faUnderline,
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faList as faListIcon,
  faListOl,
  faQuoteLeft,
  faCode,
  faLink as faChain,
  faImage,
  faVideo,
  faMusic,
  faFile,
  faFolder,
  faFolderOpen,
  faCloud,
  faCloudUpload,
  faCloudDownload,
  faRotate,
  faSpinner,
  faCircle,
  faSquare,
  faHeart,
  faThumbsUp,
  faThumbsDown,
  faSmile,
  faFrown,
  faMeh,
  faGrin,
  faLaugh,
  faAngry,
  faSurprise,
  faTired,
  faDizzy,
  faDizzy as faDizzy2,
  faGrinBeam,
  faGrinHearts,
  faGrinStars,
  faGrinTears,
  faGrinTongue,
  faGrinTongueWink,
  faGrinWink,
  faKiss,
  faKissWinkHeart,
  faLaughSquint,
  faLaughWink,
  faSadCry,
  faSadTear,
  faSmileBeam,
  faSmileWink,
  faTired as faTired2,
  faAngry as faAngry2,
  faSurprise as faSurprise2,
  faDizzy as faDizzy3,
  faGrinBeam as faGrinBeam2,
  faGrinHearts as faGrinHearts2,
  faGrinStars as faGrinStars2,
  faGrinTears as faGrinTears2,
  faGrinTongue as faGrinTongue2,
  faGrinTongueWink as faGrinTongueWink2,
  faGrinWink as faGrinWink2,
  faKiss as faKiss2,
  faKissWinkHeart as faKissWinkHeart2,
  faLaughSquint as faLaughSquint2,
  faLaughWink as faLaughWink2,
  faSadCry as faSadCry2,
  faSadTear as faSadTear2,
  faSmileBeam as faSmileBeam2,
  faSmileWink as faSmileWink2
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
  serverTimestamp,
  writeBatch
} from "firebase/firestore";

const FacultyRecruitment = () => {
  const [applications, setApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [sortBy, setSortBy] = useState("dateApplied");
  const [sortOrder, setSortOrder] = useState("desc");
  const [activeTab, setActiveTab] = useState("applications");

  // Form states
  const [applicationForm, setApplicationForm] = useState({
    personalDetails: {
      name: "",
      email: "",
      phone: "",
      address: "",
      dateOfBirth: "",
      gender: "",
      nationality: ""
    },
    academicDetails: {
      highestQualification: "",
      specialization: "",
      university: "",
      yearOfCompletion: "",
      percentage: "",
      researchAreas: []
    },
    experienceDetails: {
      totalExperience: 0,
      currentPosition: "",
      currentInstitution: "",
      previousInstitutions: [],
      publications: [],
      projects: []
    },
    applicationDetails: {
      position: "",
      department: "",
      expectedSalary: "",
      availability: "",
      coverLetter: "",
      references: []
    },
    documents: {
      resume: null,
      coverLetter: null,
      certificates: [],
      publications: [],
      references: []
    }
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shortlisted: 0,
    interviewed: 0,
    offered: 0,
    rejected: 0,
    hired: 0
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "facultyApplications"),
      (snapshot) => {
        const applicationsData = [];
        const statsData = {
          total: 0,
          pending: 0,
          shortlisted: 0,
          interviewed: 0,
          offered: 0,
          rejected: 0,
          hired: 0
        };

        snapshot.forEach((doc) => {
          const data = { id: doc.id, ...doc.data() };
          applicationsData.push(data);
          statsData.total++;
          
          switch (data.status) {
            case "Pending":
              statsData.pending++;
              break;
            case "Shortlisted":
              statsData.shortlisted++;
              break;
            case "Interviewed":
              statsData.interviewed++;
              break;
            case "Offered":
              statsData.offered++;
              break;
            case "Rejected":
              statsData.rejected++;
              break;
            case "Hired":
              statsData.hired++;
              break;
          }
        });

        setApplications(applicationsData);
        setStats(statsData);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredApplications = applications
    .filter((app) => {
      const matchesSearch = app.personalDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.personalDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.applicationDetails?.position?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !filterStatus || app.status === filterStatus;
      const matchesDepartment = !filterDepartment || app.applicationDetails?.department === filterDepartment;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "name":
          aValue = a.personalDetails?.name || "";
          bValue = b.personalDetails?.name || "";
          break;
        case "dateApplied":
          aValue = new Date(a.dateApplied?.toDate() || 0);
          bValue = new Date(b.dateApplied?.toDate() || 0);
          break;
        case "position":
          aValue = a.applicationDetails?.position || "";
          bValue = b.applicationDetails?.position || "";
          break;
        case "department":
          aValue = a.applicationDetails?.department || "";
          bValue = b.applicationDetails?.department || "";
          break;
        default:
          aValue = new Date(a.dateApplied?.toDate() || 0);
          bValue = new Date(b.dateApplied?.toDate() || 0);
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleAddApplication = () => {
    setSelectedApplication(null);
    setShowModal(true);
  };

  const handleEditApplication = (application) => {
    setSelectedApplication(application);
    setApplicationForm(application);
    setShowModal(true);
  };

  const handleSaveApplication = async () => {
    try {
      const applicationData = {
        ...applicationForm,
        status: selectedApplication ? selectedApplication.status : "Pending",
        dateApplied: selectedApplication ? selectedApplication.dateApplied : serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (selectedApplication) {
        await updateDoc(doc(db, "facultyApplications", selectedApplication.id), applicationData);
      } else {
        await addDoc(collection(db, "facultyApplications"), applicationData);
      }

      setShowModal(false);
      setSelectedApplication(null);
      setApplicationForm({
        personalDetails: { name: "", email: "", phone: "", address: "", dateOfBirth: "", gender: "", nationality: "" },
        academicDetails: { highestQualification: "", specialization: "", university: "", yearOfCompletion: "", percentage: "", researchAreas: [] },
        experienceDetails: { totalExperience: 0, currentPosition: "", currentInstitution: "", previousInstitutions: [], publications: [], projects: [] },
        applicationDetails: { position: "", department: "", expectedSalary: "", availability: "", coverLetter: "", references: [] },
        documents: { resume: null, coverLetter: null, certificates: [], publications: [], references: [] }
      });
    } catch (error) {
      console.error("Error saving application:", error);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateDoc(doc(db, "facultyApplications", applicationId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Shortlisted": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Interviewed": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Offered": return "bg-green-100 text-green-800 border-green-200";
      case "Rejected": return "bg-red-100 text-red-800 border-red-200";
      case "Hired": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending": return faClock;
      case "Shortlisted": return faUserCheck;
      case "Interviewed": return faUserTie;
      case "Offered": return faCheckCircle;
      case "Rejected": return faUserTimes;
      case "Hired": return faUserGraduate;
      default: return faUser;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recruitment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Faculty Recruitment</h2>
          <p className="text-gray-600 mt-1">Manage faculty applications and hiring process</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <FontAwesomeIcon icon={viewMode === "grid" ? faThLarge : faList} />
            <span>{viewMode === "grid" ? "List View" : "Grid View"}</span>
          </button>
          <button
            onClick={handleAddApplication}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            <FontAwesomeIcon icon={faUserPlus} />
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <FontAwesomeIcon icon={faUserPlus} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
              <FontAwesomeIcon icon={faClock} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <FontAwesomeIcon icon={faUserCheck} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Shortlisted</p>
              <p className="text-2xl font-bold text-gray-900">{stats.shortlisted}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <FontAwesomeIcon icon={faUserTie} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Interviewed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.interviewed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
              <FontAwesomeIcon icon={faCheckCircle} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Offered</p>
              <p className="text-2xl font-bold text-gray-900">{stats.offered}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white">
              <FontAwesomeIcon icon={faUserTimes} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <FontAwesomeIcon icon={faUserGraduate} className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hired</p>
              <p className="text-2xl font-bold text-gray-900">{stats.hired}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interviewed">Interviewed</option>
              <option value="Offered">Offered</option>
              <option value="Rejected">Rejected</option>
              <option value="Hired">Hired</option>
            </select>
          </div>
          <div>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics">Electronics</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Data Science">Data Science</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="Electrical">Electrical</option>
              <option value="Chemical">Chemical</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="English">English</option>
              <option value="Management">Management</option>
            </select>
          </div>
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="dateApplied">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="position">Sort by Position</option>
              <option value="department">Sort by Department</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredApplications.map((application) => (
            <div key={application.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {application.personalDetails?.name?.charAt(0) || "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                      {application.personalDetails?.name || "Unknown Name"}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {application.applicationDetails?.position || "No Position"}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FontAwesomeIcon icon={faUniversity} className="w-4" />
                    <span className="truncate">{application.applicationDetails?.department || "No Department"}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FontAwesomeIcon icon={faGraduationCap} className="w-4" />
                    <span className="truncate">{application.academicDetails?.highestQualification || "No Qualification"}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FontAwesomeIcon icon={faBriefcase} className="w-4" />
                    <span className="truncate">{application.experienceDetails?.totalExperience || 0} years</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(application.status)}`}>
                    <FontAwesomeIcon icon={getStatusIcon(application.status)} className="mr-1" />
                    {application.status || "Unknown"}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditApplication(application)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex space-x-2">
                  {application.status === "Pending" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(application.id, "Shortlisted")}
                        className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => handleStatusChange(application.id, "Rejected")}
                        className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {application.status === "Shortlisted" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(application.id, "Interviewed")}
                        className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-xs font-medium"
                      >
                        Interview
                      </button>
                    </>
                  )}
                  {application.status === "Interviewed" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(application.id, "Offered")}
                        className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium"
                      >
                        Offer
                      </button>
                      <button
                        onClick={() => handleStatusChange(application.id, "Rejected")}
                        className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {application.status === "Offered" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(application.id, "Hired")}
                        className="flex-1 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-xs font-medium"
                      >
                        Hire
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date Applied
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">
                          {application.personalDetails?.name?.charAt(0) || "A"}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {application.personalDetails?.name || "Unknown Name"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.personalDetails?.email || "No Email"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application.applicationDetails?.position || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application.applicationDetails?.department || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application.experienceDetails?.totalExperience || 0} years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(application.status)}`}>
                        <FontAwesomeIcon icon={getStatusIcon(application.status)} className="mr-1" />
                        {application.status || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application.dateApplied?.toDate().toLocaleDateString() || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditApplication(application)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredApplications.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-100">
          <FontAwesomeIcon icon={faUserPlus} className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
          <button
            onClick={handleAddApplication}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 mx-auto"
          >
            <FontAwesomeIcon icon={faUserPlus} />
            <span>Add First Application</span>
          </button>
        </div>
      )}

      {/* Application Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedApplication ? "Edit Application" : "Add New Application"}
                </h3>
                <p className="text-gray-600 mt-1">
                  {selectedApplication ? "Update application information" : "Create a new faculty application"}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Personal Details</h4>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={applicationForm.personalDetails.name}
                      onChange={(e) => setApplicationForm({
                        ...applicationForm,
                        personalDetails: { ...applicationForm.personalDetails, name: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={applicationForm.personalDetails.email}
                      onChange={(e) => setApplicationForm({
                        ...applicationForm,
                        personalDetails: { ...applicationForm.personalDetails, email: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={applicationForm.personalDetails.phone}
                      onChange={(e) => setApplicationForm({
                        ...applicationForm,
                        personalDetails: { ...applicationForm.personalDetails, phone: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                {/* Application Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Application Details</h4>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Position *</label>
                    <input
                      type="text"
                      value={applicationForm.applicationDetails.position}
                      onChange={(e) => setApplicationForm({
                        ...applicationForm,
                        applicationDetails: { ...applicationForm.applicationDetails, position: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter position applied for"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
                    <select
                      value={applicationForm.applicationDetails.department}
                      onChange={(e) => setApplicationForm({
                        ...applicationForm,
                        applicationDetails: { ...applicationForm.applicationDetails, department: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select Department</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Civil">Civil</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Chemical">Chemical</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="English">English</option>
                      <option value="Management">Management</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Salary</label>
                    <input
                      type="text"
                      value={applicationForm.applicationDetails.expectedSalary}
                      onChange={(e) => setApplicationForm({
                        ...applicationForm,
                        applicationDetails: { ...applicationForm.applicationDetails, expectedSalary: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter expected salary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApplication}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 font-medium"
              >
                <FontAwesomeIcon icon={faSave} />
                <span>Save Application</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyRecruitment;

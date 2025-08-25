import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faFileAlt,
  faCalendarAlt,
  faCheckCircle,
  faTimes,
  faEye,
  faEdit,
  faTrash,
  faPlus,
  faDownload,
  faUpload,
  faEnvelope,
  faPhone,
  faGraduationCap,
  faBriefcase,
  faClock,
  faStar,
  faComments,
  faCalendarCheck,
  faFileContract,
  faClipboardList,
  faUserCheck,
  faUserTimes,
  faUserClock,
  faUserGraduate,
  faUserTie,
  faUserCog,
  faUserShield,
  faUserSecret,
  faUserTag,
  faUserLock,
  faUnlock,
  faUserSlash,
  faUserEdit,
  faUserMinus
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

const FacultyRecruitment = () => {
  const [activeTab, setActiveTab] = useState("postings");
  const [jobPostings, setJobPostings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [offers, setOffers] = useState([]);
  const [onboarding, setOnboarding] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  // Form states
  const [jobPosting, setJobPosting] = useState({
    title: "",
    department: "",
    designation: "",
    qualification: "",
    experience: "",
    salary: "",
    location: "",
    description: "",
    requirements: "",
    deadline: "",
    status: "Open"
  });

  const [application, setApplication] = useState({
    jobId: "",
    candidateName: "",
    email: "",
    phone: "",
    qualification: "",
    experience: "",
    currentCompany: "",
    expectedSalary: "",
    resume: null,
    coverLetter: "",
    status: "Applied"
  });

  const [interview, setInterview] = useState({
    applicationId: "",
    candidateName: "",
    date: "",
    time: "",
    type: "Technical",
    interviewers: [],
    location: "",
    status: "Scheduled",
    notes: ""
  });

  useEffect(() => {
    // Fetch job postings
    const unsubscribePostings = onSnapshot(
      collection(db, "jobPostings"),
      (snapshot) => {
        const postings = [];
        snapshot.forEach((doc) => {
          postings.push({ id: doc.id, ...doc.data() });
        });
        setJobPostings(postings);
      }
    );

    // Fetch applications
    const unsubscribeApplications = onSnapshot(
      collection(db, "applications"),
      (snapshot) => {
        const apps = [];
        snapshot.forEach((doc) => {
          apps.push({ id: doc.id, ...doc.data() });
        });
        setApplications(apps);
      }
    );

    // Fetch interviews
    const unsubscribeInterviews = onSnapshot(
      collection(db, "interviews"),
      (snapshot) => {
        const ints = [];
        snapshot.forEach((doc) => {
          ints.push({ id: doc.id, ...doc.data() });
        });
        setInterviews(ints);
      }
    );

    // Fetch offers
    const unsubscribeOffers = onSnapshot(
      collection(db, "offers"),
      (snapshot) => {
        const offs = [];
        snapshot.forEach((doc) => {
          offs.push({ id: doc.id, ...doc.data() });
        });
        setOffers(offs);
      }
    );

    // Fetch onboarding
    const unsubscribeOnboarding = onSnapshot(
      collection(db, "onboarding"),
      (snapshot) => {
        const onboard = [];
        snapshot.forEach((doc) => {
          onboard.push({ id: doc.id, ...doc.data() });
        });
        setOnboarding(onboard);
      }
    );

    return () => {
      unsubscribePostings();
      unsubscribeApplications();
      unsubscribeInterviews();
      unsubscribeOffers();
      unsubscribeOnboarding();
    };
  }, []);

  const handleAddJobPosting = () => {
    setModalType("jobPosting");
    setSelectedItem(null);
    setJobPosting({
      title: "",
      department: "",
      designation: "",
      qualification: "",
      experience: "",
      salary: "",
      location: "",
      description: "",
      requirements: "",
      deadline: "",
      status: "Open"
    });
    setShowModal(true);
  };

  const handleAddApplication = () => {
    setModalType("application");
    setSelectedItem(null);
    setApplication({
      jobId: "",
      candidateName: "",
      email: "",
      phone: "",
      qualification: "",
      experience: "",
      currentCompany: "",
      expectedSalary: "",
      resume: null,
      coverLetter: "",
      status: "Applied"
    });
    setShowModal(true);
  };

  const handleSaveJobPosting = async () => {
    try {
      const postingData = {
        ...jobPosting,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (selectedItem) {
        await updateDoc(doc(db, "jobPostings", selectedItem.id), postingData);
      } else {
        await addDoc(collection(db, "jobPostings"), postingData);
      }

      setShowModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error saving job posting:", error);
    }
  };

  const handleSaveApplication = async () => {
    try {
      const applicationData = {
        ...application,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (selectedItem) {
        await updateDoc(doc(db, "applications", selectedItem.id), applicationData);
      } else {
        await addDoc(collection(db, "applications"), applicationData);
      }

      setShowModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error saving application:", error);
    }
  };

  const handleSaveInterview = async () => {
    try {
      const interviewData = {
        ...interview,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (selectedItem) {
        await updateDoc(doc(db, "interviews", selectedItem.id), interviewData);
      } else {
        await addDoc(collection(db, "interviews"), interviewData);
      }

      setShowModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error saving interview:", error);
    }
  };

  const tabs = [
    { id: "postings", name: "Job Postings", icon: faFileAlt, count: jobPostings.length },
    { id: "applications", name: "Applications", icon: faUserPlus, count: applications.length },
    { id: "interviews", name: "Interviews", icon: faCalendarAlt, count: interviews.length },
    { id: "offers", name: "Offers", icon: faFileContract, count: offers.length },
    { id: "onboarding", name: "Onboarding", icon: faClipboardList, count: onboarding.length }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "postings":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Job Postings</h3>
              <button
                onClick={handleAddJobPosting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Job Posting
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobPostings.map((posting) => (
                <div key={posting.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{posting.title}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      posting.status === "Open" ? "bg-green-100 text-green-800" :
                      posting.status === "Closed" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {posting.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Department:</strong> {posting.department}</p>
                    <p><strong>Designation:</strong> {posting.designation}</p>
                    <p><strong>Experience:</strong> {posting.experience}</p>
                    <p><strong>Salary:</strong> {posting.salary}</p>
                    <p><strong>Deadline:</strong> {posting.deadline}</p>
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

      case "applications":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Applications</h3>
              <button
                onClick={handleAddApplication}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Application
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{app.candidateName}</div>
                          <div className="text-sm text-gray-500">{app.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {jobPostings.find(p => p.id === app.jobId)?.title || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.experience} years
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          app.status === "Applied" ? "bg-blue-100 text-blue-800" :
                          app.status === "Shortlisted" ? "bg-yellow-100 text-yellow-800" :
                          app.status === "Rejected" ? "bg-red-100 text-red-800" :
                          app.status === "Hired" ? "bg-green-100 text-green-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.createdAt?.toDate().toLocaleDateString()}
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
                            <FontAwesomeIcon icon={faCalendarAlt} />
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

      case "interviews":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Interviews</h3>
              <button
                onClick={() => {
                  setModalType("interview");
                  setShowModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Schedule Interview
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {interviews.map((interview) => (
                <div key={interview.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{interview.candidateName}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      interview.status === "Scheduled" ? "bg-blue-100 text-blue-800" :
                      interview.status === "Completed" ? "bg-green-100 text-green-800" :
                      interview.status === "Cancelled" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {interview.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Date:</strong> {interview.date}</p>
                    <p><strong>Time:</strong> {interview.time}</p>
                    <p><strong>Type:</strong> {interview.type}</p>
                    <p><strong>Location:</strong> {interview.location}</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <FontAwesomeIcon icon={faComments} />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-900">
                      <FontAwesomeIcon icon={faStar} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "offers":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Offer Letters</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {offers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {offer.candidateName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {offer.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {offer.salary}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          offer.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                          offer.status === "Accepted" ? "bg-green-100 text-green-800" :
                          offer.status === "Rejected" ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {offer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <FontAwesomeIcon icon={faDownload} />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <FontAwesomeIcon icon={faEdit} />
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

      case "onboarding":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Onboarding Checklist</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {onboarding.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{item.employeeName}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      item.status === "Completed" ? "bg-green-100 text-green-800" :
                      item.status === "In Progress" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Department:</strong> {item.department}</p>
                    <p><strong>Joining Date:</strong> {item.joiningDate}</p>
                    <p><strong>Progress:</strong> {item.progress}%</p>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
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

  const renderModalContent = () => {
    switch (modalType) {
      case "jobPosting":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input
                type="text"
                value={jobPosting.title}
                onChange={(e) => setJobPosting({...jobPosting, title: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={jobPosting.department}
                onChange={(e) => setJobPosting({...jobPosting, department: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics">Electronics</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Data Science">Data Science</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <select
                value={jobPosting.designation}
                onChange={(e) => setJobPosting({...jobPosting, designation: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Designation</option>
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer">Lecturer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience Required</label>
              <input
                type="text"
                value={jobPosting.experience}
                onChange={(e) => setJobPosting({...jobPosting, experience: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., 5-8 years"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
              <input
                type="text"
                value={jobPosting.salary}
                onChange={(e) => setJobPosting({...jobPosting, salary: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., 8-12 LPA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
              <input
                type="date"
                value={jobPosting.deadline}
                onChange={(e) => setJobPosting({...jobPosting, deadline: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
              <textarea
                value={jobPosting.description}
                onChange={(e) => setJobPosting({...jobPosting, description: e.target.value})}
                rows="4"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
              <textarea
                value={jobPosting.requirements}
                onChange={(e) => setJobPosting({...jobPosting, requirements: e.target.value})}
                rows="4"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        );

      case "application":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Name</label>
              <input
                type="text"
                value={application.candidateName}
                onChange={(e) => setApplication({...application, candidateName: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={application.email}
                onChange={(e) => setApplication({...application, email: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={application.phone}
                onChange={(e) => setApplication({...application, phone: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Position</label>
              <select
                value={application.jobId}
                onChange={(e) => setApplication({...application, jobId: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Job</option>
                {jobPostings.map((job) => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                value={application.experience}
                onChange={(e) => setApplication({...application, experience: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Salary</label>
              <input
                type="text"
                value={application.expectedSalary}
                onChange={(e) => setApplication({...application, expectedSalary: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
              <textarea
                value={application.coverLetter}
                onChange={(e) => setApplication({...application, coverLetter: e.target.value})}
                rows="4"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        );

      case "interview":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Name</label>
              <input
                type="text"
                value={interview.candidateName}
                onChange={(e) => setInterview({...interview, candidateName: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interview Date</label>
              <input
                type="date"
                value={interview.date}
                onChange={(e) => setInterview({...interview, date: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interview Time</label>
              <input
                type="time"
                value={interview.time}
                onChange={(e) => setInterview({...interview, time: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interview Type</label>
              <select
                value={interview.type}
                onChange={(e) => setInterview({...interview, type: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Technical">Technical</option>
                <option value="HR">HR</option>
                <option value="Panel">Panel</option>
                <option value="Online">Online</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={interview.location}
                onChange={(e) => setInterview({...interview, location: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={interview.notes}
                onChange={(e) => setInterview({...interview, notes: e.target.value})}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        );

      default:
        return <div>Select modal type</div>;
    }
  };

  const handleSave = () => {
    switch (modalType) {
      case "jobPosting":
        handleSaveJobPosting();
        break;
      case "application":
        handleSaveApplication();
        break;
      case "interview":
        handleSaveInterview();
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Faculty Recruitment</h2>
          <p className="text-gray-600">Manage the complete recruitment lifecycle</p>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {modalType === "jobPosting" ? "Add Job Posting" :
                 modalType === "application" ? "Add Application" :
                 modalType === "interview" ? "Schedule Interview" : "Modal"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="mb-6">
              {renderModalContent()}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyRecruitment;

import React, { useState, useEffect } from "react";
import studentApiService from '../services/studentApiService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChalkboardTeacher,
  faBook,
  faCalendarAlt,
  faClock,
  faUsers,
  faCheckCircle,
  faTimes,
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faDownload,
  faUpload,
  faStar,
  faComments,
  faFileAlt,


  faCalculator,
  faChartBar,
  faCalendarCheck,
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

const TeachingManagement = () => {
  const [activeTab, setActiveTab] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [workloads, setWorkloads] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [syllabus, setSyllabus] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  // Form states
  const [courseAllotment, setCourseAllotment] = useState({
    courseCode: "",
    courseName: "",
    department: "",
    semester: "",
    facultyId: "",
    facultyName: "",
    credits: "",
    hoursPerWeek: "",
    labHours: "",
    tutorialHours: "",
    maxStudents: "",
    status: "Active"
  });

  const [timetableEntry, setTimetableEntry] = useState({
    facultyId: "",
    facultyName: "",
    courseCode: "",
    courseName: "",
    day: "",
    timeSlot: "",
    room: "",
    type: "Lecture",
    semester: "",
    academicYear: ""
  });

  const [workloadEntry, setWorkloadEntry] = useState({
    facultyId: "",
    facultyName: "",
    department: "",
    semester: "",
    teachingHours: 0,
    labHours: 0,
    tutorialHours: 0,
    projectGuidance: 0,
    administrativeDuties: 0,
    totalWorkload: 0,
    maxWorkload: 40
  });

  const [attendanceEntry, setAttendanceEntry] = useState({
    facultyId: "",
    facultyName: "",
    courseCode: "",
    date: "",
    present: true,
    reason: "",
    substituteFaculty: ""
  });

  useEffect(() => {
    // Fetch courses
    const unsubscribeCourses = onSnapshot(
      collection(db, "courseAllotments"),
      (snapshot) => {
        const courseData = [];
        snapshot.forEach((doc) => {
          courseData.push({ id: doc.id, ...doc.data() });
        });
        setCourses(courseData);
      }
    );

    // Fetch timetables
    const unsubscribeTimetables = onSnapshot(
      collection(db, "timetables"),
      (snapshot) => {
        const timetableData = [];
        snapshot.forEach((doc) => {
          timetableData.push({ id: doc.id, ...doc.data() });
        });
        setTimetables(timetableData);
      }
    );

    // Fetch workloads
    const unsubscribeWorkloads = onSnapshot(
      collection(db, "facultyWorkloads"),
      (snapshot) => {
        const workloadData = [];
        snapshot.forEach((doc) => {
          workloadData.push({ id: doc.id, ...doc.data() });
        });
        setWorkloads(workloadData);
      }
    );

    // Fetch attendance
    const unsubscribeAttendance = onSnapshot(
      collection(db, "facultyAttendance"),
      (snapshot) => {
        const attendanceData = [];
        snapshot.forEach((doc) => {
          attendanceData.push({ id: doc.id, ...doc.data() });
        });
        setAttendance(attendanceData);
      }
    );

    // Fetch syllabus
    const unsubscribeSyllabus = onSnapshot(
      collection(db, "syllabus"),
      (snapshot) => {
        const syllabusData = [];
        snapshot.forEach((doc) => {
          syllabusData.push({ id: doc.id, ...doc.data() });
        });
        setSyllabus(syllabusData);
      }
    );

    // Fetch feedback
    const unsubscribeFeedback = onSnapshot(
      collection(db, "studentFeedback"),
      (snapshot) => {
        const feedbackData = [];
        snapshot.forEach((doc) => {
          feedbackData.push({ id: doc.id, ...doc.data() });
        });
        setFeedback(feedbackData);
      }
    );

    return () => {
      unsubscribeCourses();
      unsubscribeTimetables();
      unsubscribeWorkloads();
      unsubscribeAttendance();
      unsubscribeSyllabus();
      unsubscribeFeedback();
    };
  }, []);

  const handleAddCourse = () => {
    setModalType("course");
    setSelectedItem(null);
    setCourseAllotment({
      courseCode: "",
      courseName: "",
      department: "",
      semester: "",
      facultyId: "",
      facultyName: "",
      credits: "",
      hoursPerWeek: "",
      labHours: "",
      tutorialHours: "",
      maxStudents: "",
      status: "Active"
    });
    setShowModal(true);
  };

  const handleAddTimetable = () => {
    setModalType("timetable");
    setSelectedItem(null);
    setTimetableEntry({
      facultyId: "",
      facultyName: "",
      courseCode: "",
      courseName: "",
      day: "",
      timeSlot: "",
      room: "",
      type: "Lecture",
      semester: "",
      academicYear: ""
    });
    setShowModal(true);
  };

  const handleAddWorkload = () => {
    setModalType("workload");
    setSelectedItem(null);
    setWorkloadEntry({
      facultyId: "",
      facultyName: "",
      department: "",
      semester: "",
      teachingHours: 0,
      labHours: 0,
      tutorialHours: 0,
      projectGuidance: 0,
      administrativeDuties: 0,
      totalWorkload: 0,
      maxWorkload: 40
    });
    setShowModal(true);
  };

  const handleSaveCourse = async () => {
    try {
      const courseData = {
        ...courseAllotment,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (selectedItem) {
        await updateDoc(doc(db, "courseAllotments", selectedItem.id), courseData);
      } else {
        await addDoc(collection(db, "courseAllotments"), courseData);
      }

      setShowModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error saving course:", error);
    }
  };

  const handleSaveTimetable = async () => {
    try {
      const timetableData = {
        ...timetableEntry,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (selectedItem) {
        await updateDoc(doc(db, "timetables", selectedItem.id), timetableData);
      } else {
        await addDoc(collection(db, "timetables"), timetableData);
      }

      setShowModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error saving timetable:", error);
    }
  };

  const handleSaveWorkload = async () => {
    try {
      const totalWorkload = parseInt(workloadEntry.teachingHours) + 
                           parseInt(workloadEntry.labHours) + 
                           parseInt(workloadEntry.tutorialHours) + 
                           parseInt(workloadEntry.projectGuidance) + 
                           parseInt(workloadEntry.administrativeDuties);

      const workloadData = {
        ...workloadEntry,
        totalWorkload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (selectedItem) {
        await updateDoc(doc(db, "facultyWorkloads", selectedItem.id), workloadData);
      } else {
        await addDoc(collection(db, "facultyWorkloads"), workloadData);
      }

      setShowModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error saving workload:", error);
    }
  };

  const tabs = [
    { id: "courses", name: "Course Allotment", icon: faBook, count: courses.length },
    { id: "timetable", name: "Timetable", icon: faCalendarAlt, count: timetables.length },
    { id: "workload", name: "Workload", icon: faCalculator, count: workloads.length },
    { id: "attendance", name: "Attendance", icon: faCheckCircle, count: attendance.length },
    { id: "syllabus", name: "Syllabus", icon: faFileAlt, count: syllabus.length },
    { id: "feedback", name: "Student Feedback", icon: faStar, count: feedback.length }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "courses":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Course Allotment</h3>
              <button
                onClick={handleAddCourse}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Allot Course
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{course.courseName}</div>
                          <div className="text-sm text-gray-500">{course.courseCode}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.facultyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.semester}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.hoursPerWeek} hrs/week
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          course.status === "Active" ? "bg-green-100 text-green-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {course.status}
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
                          <button className="text-red-600 hover:text-red-900">
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
        );

      case "timetable":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Timetable Management</h3>
              <button
                onClick={handleAddTimetable}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Timetable Entry
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {timetables.map((entry) => (
                <div key={entry.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{entry.courseName}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      entry.type === "Lecture" ? "bg-blue-100 text-blue-800" :
                      entry.type === "Lab" ? "bg-green-100 text-green-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {entry.type}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Faculty:</strong> {entry.facultyName}</p>
                    <p><strong>Day:</strong> {entry.day}</p>
                    <p><strong>Time:</strong> {entry.timeSlot}</p>
                    <p><strong>Room:</strong> {entry.room}</p>
                    <p><strong>Semester:</strong> {entry.semester}</p>
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

      case "workload":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Workload Management</h3>
              <button
                onClick={handleAddWorkload}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Workload
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workloads.map((workload) => (
                <div key={workload.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{workload.facultyName}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      workload.totalWorkload <= workload.maxWorkload ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {workload.totalWorkload}/{workload.maxWorkload} hrs
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Department:</strong> {workload.department}</p>
                    <p><strong>Semester:</strong> {workload.semester}</p>
                    <p><strong>Teaching:</strong> {workload.teachingHours} hrs</p>
                    <p><strong>Lab:</strong> {workload.labHours} hrs</p>
                    <p><strong>Tutorial:</strong> {workload.tutorialHours} hrs</p>
                    <p><strong>Project:</strong> {workload.projectGuidance} hrs</p>
                    <p><strong>Admin:</strong> {workload.administrativeDuties} hrs</p>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          workload.totalWorkload <= workload.maxWorkload ? "bg-green-600" : "bg-red-600"
                        }`}
                        style={{ width: `${Math.min((workload.totalWorkload / workload.maxWorkload) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "attendance":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Faculty Attendance</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendance.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.facultyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.courseCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          entry.present ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {entry.present ? "Present" : "Absent"}
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

      case "syllabus":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Syllabus Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {syllabus.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{item.courseName}</h4>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.semester}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Department:</strong> {item.department}</p>
                    <p><strong>Faculty:</strong> {item.facultyName}</p>
                    <p><strong>Units:</strong> {item.units}</p>
                    <p><strong>Last Updated:</strong> {item.updatedAt?.toDate().toLocaleDateString()}</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-900">
                      <FontAwesomeIcon icon={faUpload} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "feedback":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Student Feedback</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {feedback.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{item.facultyName}</h4>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{item.rating}/5</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Course:</strong> {item.courseName}</p>
                    <p><strong>Semester:</strong> {item.semester}</p>
                    <p><strong>Students:</strong> {item.studentCount}</p>
                    <p><strong>Date:</strong> {item.date}</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-700 italic">"{item.comments}"</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-900">
                      <FontAwesomeIcon icon={faChartBar} />
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

  const renderModalContent = () => {
    switch (modalType) {
      case "course":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
              <input
                type="text"
                value={courseAllotment.courseCode}
                onChange={(e) => setCourseAllotment({...courseAllotment, courseCode: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
              <input
                type="text"
                value={courseAllotment.courseName}
                onChange={(e) => setCourseAllotment({...courseAllotment, courseName: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={courseAllotment.department}
                onChange={(e) => setCourseAllotment({...courseAllotment, department: e.target.value})}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select
                value={courseAllotment.semester}
                onChange={(e) => setCourseAllotment({...courseAllotment, semester: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Name</label>
              <input
                type="text"
                value={courseAllotment.facultyName}
                onChange={(e) => setCourseAllotment({...courseAllotment, facultyName: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
              <input
                type="number"
                value={courseAllotment.credits}
                onChange={(e) => setCourseAllotment({...courseAllotment, credits: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours per Week</label>
              <input
                type="number"
                value={courseAllotment.hoursPerWeek}
                onChange={(e) => setCourseAllotment({...courseAllotment, hoursPerWeek: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lab Hours</label>
              <input
                type="number"
                value={courseAllotment.labHours}
                onChange={(e) => setCourseAllotment({...courseAllotment, labHours: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        );

      case "timetable":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Name</label>
              <input
                type="text"
                value={timetableEntry.facultyName}
                onChange={(e) => setTimetableEntry({...timetableEntry, facultyName: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
              <input
                type="text"
                value={timetableEntry.courseName}
                onChange={(e) => setTimetableEntry({...timetableEntry, courseName: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
              <select
                value={timetableEntry.day}
                onChange={(e) => setTimetableEntry({...timetableEntry, day: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
              <select
                value={timetableEntry.timeSlot}
                onChange={(e) => setTimetableEntry({...timetableEntry, timeSlot: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Time</option>
                <option value="9:00-10:00">9:00-10:00</option>
                <option value="10:00-11:00">10:00-11:00</option>
                <option value="11:00-12:00">11:00-12:00</option>
                <option value="12:00-1:00">12:00-1:00</option>
                <option value="2:00-3:00">2:00-3:00</option>
                <option value="3:00-4:00">3:00-4:00</option>
                <option value="4:00-5:00">4:00-5:00</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
              <input
                type="text"
                value={timetableEntry.room}
                onChange={(e) => setTimetableEntry({...timetableEntry, room: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={timetableEntry.type}
                onChange={(e) => setTimetableEntry({...timetableEntry, type: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Lecture">Lecture</option>
                <option value="Lab">Lab</option>
                <option value="Tutorial">Tutorial</option>
              </select>
            </div>
          </div>
        );

      case "workload":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Name</label>
              <input
                type="text"
                value={workloadEntry.facultyName}
                onChange={(e) => setWorkloadEntry({...workloadEntry, facultyName: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={workloadEntry.department}
                onChange={(e) => setWorkloadEntry({...workloadEntry, department: e.target.value})}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Teaching Hours</label>
              <input
                type="number"
                value={workloadEntry.teachingHours}
                onChange={(e) => setWorkloadEntry({...workloadEntry, teachingHours: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lab Hours</label>
              <input
                type="number"
                value={workloadEntry.labHours}
                onChange={(e) => setWorkloadEntry({...workloadEntry, labHours: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tutorial Hours</label>
              <input
                type="number"
                value={workloadEntry.tutorialHours}
                onChange={(e) => setWorkloadEntry({...workloadEntry, tutorialHours: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Guidance</label>
              <input
                type="number"
                value={workloadEntry.projectGuidance}
                onChange={(e) => setWorkloadEntry({...workloadEntry, projectGuidance: e.target.value})}
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
      case "course":
        handleSaveCourse();
        break;
      case "timetable":
        handleSaveTimetable();
        break;
      case "workload":
        handleSaveWorkload();
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
          <h2 className="text-2xl font-bold text-gray-900">Teaching & Academic Management</h2>
          <p className="text-gray-600">Manage course allotment, timetables, and academic activities</p>
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
                {modalType === "course" ? "Allot Course" :
                 modalType === "timetable" ? "Add Timetable Entry" :
                 modalType === "workload" ? "Add Workload" : "Modal"}
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

export default TeachingManagement;

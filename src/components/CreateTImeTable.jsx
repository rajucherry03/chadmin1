import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, doc, getDocs, addDoc, getDoc, query, where } from "firebase/firestore";
import { 
  FaCalendarAlt, 
  FaPlus, 
  FaSave, 
  FaClock, 
  FaMapMarkerAlt, 
  FaUserTie, 
  FaBook, 
  FaTrash, 
  FaEye,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaLightbulb
} from "react-icons/fa";

const CreateTimetable = () => {
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState({});
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [existingTimetable, setExistingTimetable] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  
  const [formData, setFormData] = useState({
    day: "",
    courseId: "",
    facultyId: "",
    room: "",
    startTime: "",
    endTime: "",
    periods: [],
    combinedPeriods: false,
  });

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const periodsList = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th"];
  const timeSlots = [
    { period: "1st", start: "09:00", end: "09:55" },
    { period: "2nd", start: "09:55", end: "10:50" },
    { period: "3rd", start: "10:50", end: "11:45" },
    { period: "4th", start: "11:45", end: "12:40" },
    { period: "5th", start: "12:40", end: "13:35" },
    { period: "6th", start: "14:30", end: "15:25" },
    { period: "7th", start: "15:25", end: "16:20" },
  ];

  // Fetch data for the selected year and section
  useEffect(() => {
    const fetchData = async () => {
      if (year && section) {
        setLoading(true);
        try {
          // Fetch courses
          const coursesPath = `/courses/Computer Science & Engineering (Data Science)/years/${year}/sections/${section}/courseDetails`;
          const courseSnapshot = await getDocs(collection(db, coursesPath));
          const coursesData = [];
          const instructorIds = new Set();

          courseSnapshot.docs.forEach((doc) => {
            const course = doc.data();
            coursesData.push({
              id: doc.id,
              courseName: course.courseName,
              instructor: course.instructor || null,
            });
            if (course.instructor) {
              instructorIds.add(course.instructor);
            }
          });
          setCourses(coursesData);

          // Fetch faculty
          const facultySnapshot = await getDocs(collection(db, "faculty"));
          const facultyMap = {};

          facultySnapshot.docs.forEach((doc) => {
            const facultyData = doc.data();
            facultyMap[doc.id] = facultyData.name || "Unknown Faculty";
          });

          setFaculty(facultyMap);

          // Fetch students
          const studentsPath = `/students/${year}/${section}`;
          const studentSnapshot = await getDocs(collection(db, studentsPath));
          const studentsData = studentSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setStudents(studentsData);

          // Fetch existing timetable
          const timetablePath = `/timetables/${year}/${section}`;
          const timetableSnapshot = await getDocs(collection(db, timetablePath));
          const timetableData = timetableSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setExistingTimetable(timetableData);

        } catch (error) {
          console.error("Error fetching data:", error.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [year, section]);

  // Auto-fill time based on selected periods
  const handlePeriodChange = (period) => {
    const selectedPeriods = formData.periods.includes(period)
      ? formData.periods.filter((p) => p !== period)
      : [...formData.periods, period].sort((a, b) => {
          const aIndex = periodsList.indexOf(a);
          const bIndex = periodsList.indexOf(b);
          return aIndex - bIndex;
        });

    // Auto-fill time slots
    if (selectedPeriods.length > 0) {
      const firstPeriod = selectedPeriods[0];
      const lastPeriod = selectedPeriods[selectedPeriods.length - 1];
      
      const firstTimeSlot = timeSlots.find(slot => slot.period === firstPeriod);
      const lastTimeSlot = timeSlots.find(slot => slot.period === lastPeriod);
      
      if (firstTimeSlot && lastTimeSlot) {
        setFormData({
          ...formData,
          periods: selectedPeriods,
          startTime: firstTimeSlot.start,
          endTime: lastTimeSlot.end,
        });
      }
    } else {
      setFormData({
        ...formData,
        periods: selectedPeriods,
        startTime: "",
        endTime: "",
      });
    }
  };

  // Check for conflicts
  const checkConflicts = () => {
    const newConflicts = [];
    
    existingTimetable.forEach(existing => {
      if (existing.day === formData.day) {
        existing.periods.forEach(existingPeriod => {
          if (formData.periods.includes(existingPeriod)) {
            newConflicts.push({
              type: 'period',
              message: `Period ${existingPeriod} is already occupied by ${existing.courseId}`,
              existing
            });
          }
        });
      }
    });

    // Check faculty conflicts
    existingTimetable.forEach(existing => {
      if (existing.facultyId === formData.facultyId && existing.day === formData.day) {
        existing.periods.forEach(existingPeriod => {
          if (formData.periods.includes(existingPeriod)) {
            newConflicts.push({
              type: 'faculty',
              message: `Faculty ${faculty[formData.facultyId]} is already assigned to ${existing.courseId} during period ${existingPeriod}`,
              existing
            });
          }
        });
      }
    });

    setConflicts(newConflicts);
    return newConflicts.length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.periods.length) {
      alert("Please select at least one period.");
      return;
    }

    if (!checkConflicts()) {
      alert("Please resolve conflicts before saving.");
      return;
    }

    setLoading(true);
    try {
      const timetableData = {
        ...formData,
        year,
        section,
        studentIds: students.map((student) => student.id),
        createdAt: new Date(),
      };

      const timetablePath = `/timetables/${year}/${section}`;
      await addDoc(collection(db, timetablePath), timetableData);
      alert("Timetable entry added successfully!");

      // Reset form
      setFormData({
        day: "",
        courseId: "",
        facultyId: "",
        room: "",
        startTime: "",
        endTime: "",
        periods: [],
        combinedPeriods: false,
      });
      
      // Refresh existing timetable
      const timetableSnapshot = await getDocs(collection(db, timetablePath));
      const updatedTimetableData = timetableSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExistingTimetable(updatedTimetableData);
      
    } catch (error) {
      console.error("Error adding timetable:", error.message);
      alert("Failed to add timetable entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getDayColor = (day) => {
    const colors = {
      'Monday': 'bg-blue-50 border-blue-200',
      'Tuesday': 'bg-green-50 border-green-200',
      'Wednesday': 'bg-purple-50 border-purple-200',
      'Thursday': 'bg-orange-50 border-orange-200',
      'Friday': 'bg-pink-50 border-pink-200',
      'Saturday': 'bg-gray-50 border-gray-200'
    };
    return colors[day] || 'bg-white border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
              <FaCalendarAlt className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Create Class Timetable</h1>
              <p className="text-gray-600">Add and manage class schedules with automatic conflict detection</p>
            </div>
          </div>
        </div>

        {/* Selection Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="">Select Year</option>
                <option value="I">First Year</option>
                <option value="II">Second Year</option>
                <option value="III">Third Year</option>
                <option value="IV">Fourth Year</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Section</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="">Select Section</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading data...</p>
            </div>
          </div>
        ) : year && section ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Timetable Form */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <FaPlus className="text-green-500 text-xl" />
                <h2 className="text-xl font-bold text-gray-800">Add New Entry</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Day Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Day of Week</label>
                  <div className="grid grid-cols-2 gap-2">
                    {daysOfWeek.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setFormData({ ...formData, day })}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 font-medium ${
                          formData.day === day
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-green-300 text-gray-700'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Course and Faculty Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Course</label>
                    <select
                      value={formData.courseId}
                      onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.courseName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Faculty</label>
                    <select
                      value={formData.facultyId}
                      onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="">Select Faculty</option>
                      {Object.entries(faculty).map(([id, name]) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Room and Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Room</label>
                    <input
                      type="text"
                      placeholder="e.g., Lab 6, Room 101"
                      value={formData.room}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Period Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Select Period(s)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {periodsList.map((period) => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => handlePeriodChange(period)}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 font-medium text-sm ${
                          formData.periods.includes(period)
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-green-300 text-gray-700'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Tip: Select periods to automatically fill time slots
                  </p>
                </div>

                {/* Conflicts Display */}
                {conflicts.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FaExclamationTriangle className="text-red-500" />
                      <span className="font-semibold text-red-700">Conflicts Detected</span>
                    </div>
                    <ul className="space-y-1">
                      {conflicts.map((conflict, index) => (
                        <li key={index} className="text-sm text-red-600 flex items-center gap-2">
                          <FaTimes className="text-xs" />
                          {conflict.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || conflicts.length > 0}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Add Timetable Entry
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Preview Section */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FaEye className="text-blue-500 text-xl" />
                  <h2 className="text-xl font-bold text-gray-800">Quick Stats</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{existingTimetable.length}</div>
                    <div className="text-sm text-gray-600">Total Entries</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{courses.length}</div>
                    <div className="text-sm text-gray-600">Available Courses</div>
                  </div>
                </div>
              </div>

              {/* Current Timetable Preview */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-purple-500 text-xl" />
                    <h2 className="text-xl font-bold text-gray-800">Current Timetable</h2>
                  </div>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-3 py-1 bg-purple-100 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors duration-200"
                  >
                    {showPreview ? 'Hide' : 'Show'} Preview
                  </button>
                </div>

                {showPreview && existingTimetable.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {existingTimetable.map((entry, index) => (
                      <div key={index} className={`p-4 rounded-xl border ${getDayColor(entry.day)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800">{entry.day}</span>
                          <span className="text-sm text-gray-500">{entry.periods.join(', ')}</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <FaBook className="text-blue-500" />
                            <span className="text-gray-700">{courses.find(c => c.id === entry.courseId)?.courseName || entry.courseId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaUserTie className="text-green-500" />
                            <span className="text-gray-700">{faculty[entry.facultyId] || entry.facultyId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-purple-500" />
                            <span className="text-gray-700">{entry.room}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaClock className="text-orange-500" />
                            <span className="text-gray-700">{entry.startTime} - {entry.endTime}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : showPreview ? (
                  <div className="text-center py-8 text-gray-500">
                    <FaCalendarAlt className="text-4xl mx-auto mb-2 text-gray-300" />
                    <p>No timetable entries yet</p>
                  </div>
                ) : null}
              </div>

              {/* Tips Section */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <FaLightbulb className="text-yellow-500 text-xl" />
                  <h3 className="font-semibold text-gray-800">Smart Features</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-green-500 text-xs" />
                    Automatic time slot filling based on period selection
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-green-500 text-xs" />
                    Real-time conflict detection for periods and faculty
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-green-500 text-xs" />
                    Visual preview of current timetable
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-green-500 text-xs" />
                    Easy day and period selection with buttons
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Select Year & Section</h3>
              <p className="text-gray-500">Choose the academic year and section to start creating the timetable</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTimetable;

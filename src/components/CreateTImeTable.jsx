import React, { useState, useEffect } from "react";
import studentApiService from '../services/studentApiService';
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
import {
  coursesCollectionPath,
  coursesCollectionPathYearSem,
  timetableCollectionPathLegacy,
  timetableCollectionPathYearSem,
  possibleSemesterKeysForYear,
  studentsCollectionPath,
  possibleStudentsCollectionPaths,
  courseDocPath,
  courseDocPathYearSem,
} from "../utils/pathBuilders";

const CreateTimetable = () => {
  const [department, setDepartment] = useState("CSE_DS");
  const [year, setYear] = useState("");
  const [semesterKey, setSemesterKey] = useState("");
  const [section, setSection] = useState("");
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState({});
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [existingTimetable, setExistingTimetable] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [draftEntries, setDraftEntries] = useState([]);

  const storageKey = `${department}_${year}_${semesterKey || 'LEGACY'}_${(section || '').toUpperCase()}__TT_DRAFT`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setDraftEntries(parsed);
      } else {
        setDraftEntries([]);
      }
    } catch (_) {
      setDraftEntries([]);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(draftEntries));
    } catch (_) {}
  }, [draftEntries, storageKey]);

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
    { period: "1st", start: "09:10", end: "10:10" },
    { period: "2nd", start: "10:10", end: "11:10" },
    { period: "3rd", start: "11:10", end: "12:10" },
    { period: "4th", start: "13:00", end: "14:00" },
    { period: "5th", start: "14:00", end: "15:00" },
    { period: "6th", start: "15:00", end: "16:00" },
    { period: "7th", start: "16:00", end: "17:00" },
  ];

  // Fetch data for the selected department, year, semester and section
  useEffect(() => {
    const fetchData = async () => {
      if (!department || !year || !section) return;
      setLoading(true);
      try {
        const normalizedSection = section.toUpperCase();

        // Fetch faculty for department
        try {
          const facSnap = await getDocs(collection(db, `faculty/${department}/members`));
          const facMap = {};
          facSnap.docs.forEach((d) => {
            const data = d.data();
            facMap[d.id] = data.name || data.fullName || d.id;
          });
          setFaculty(facMap);
        } catch (_) {
          setFaculty({});
        }

        // Fetch courses assigned to this section from year_sem, or fallback to legacy ALL_SECTIONS
        let coursesData = [];
        const trySemKeys = semesterKey ? [semesterKey.toUpperCase()] : possibleSemesterKeysForYear(year);
        for (const sk of trySemKeys) {
          try {
            const path = coursesCollectionPathYearSem(department, sk);
            const snap = await getDocs(collection(db, path));
            const list = [];
            for (const d of snap.docs) {
              const secRef = doc(db, `${path}/${d.id}/sections/${normalizedSection}`);
              const secSnap = await getDoc(secRef);
              if (secSnap.exists()) {
                const meta = d.data();
                const sec = secSnap.data();
                list.push({ id: d.id, courseName: meta.courseName || meta.title || d.id, instructor: sec.instructor || null, _ys: sk });
              }
            }
            if (list.length > 0) {
              coursesData = list;
              break;
            }
          } catch (_) {}
        }
        // Legacy fallback: per-year ALL_SECTIONS
        if (coursesData.length === 0) {
          try {
            const legacyPath = coursesCollectionPath(department, year, 'ALL_SECTIONS');
            const legacySnap = await getDocs(collection(db, legacyPath));
            coursesData = legacySnap.docs.map((d) => ({ id: d.id, courseName: (d.data().courseName || d.data().title || d.id), instructor: d.data().instructor || null }));
          } catch (_) {}
        }
        setCourses(coursesData);

        // Fetch students using normalized helpers (and legacy fallback)
        let studentsData = [];
        try {
          const mainPath = studentsCollectionPath(department, year, normalizedSection);
          const mainSnap = await getDocs(collection(db, mainPath));
          if (mainSnap.size > 0) {
            studentsData = mainSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
          } else {
            const variants = possibleStudentsCollectionPaths(department, year, normalizedSection);
            for (const p of variants) {
              try {
                const vSnap = await getDocs(collection(db, p));
                if (vSnap.size > 0) {
                  studentsData = vSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
                  break;
                }
              } catch (_) {}
            }
            if (studentsData.length === 0) {
              const legacySnap = await getDocs(collection(db, `students/${year}/${normalizedSection}`));
              studentsData = legacySnap.docs.map((d) => ({ id: d.id, ...d.data() }));
            }
          }
        } catch (_) {}
        setStudents(studentsData);

        // Fetch existing timetable from year_sem path (or legacy fallback)
        try {
          const path = semesterKey
            ? timetableCollectionPathYearSem(department, semesterKey.toUpperCase(), normalizedSection)
            : timetableCollectionPathLegacy(year, normalizedSection);
          const ttSnap = await getDocs(collection(db, path));
          const ttData = ttSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setExistingTimetable(ttData);
        } catch (_) {
          setExistingTimetable([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [department, year, semesterKey, section]);

  useEffect(() => {
    const selected = courses.find((c) => c.id === formData.courseId);
    if (selected && selected.instructor && formData.facultyId !== selected.instructor) {
      setFormData((prev) => ({ ...prev, facultyId: selected.instructor }));
    }
  }, [formData.courseId, courses]);

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

  // Utility: map weekday to date of current week
  const getWeekDates = () => {
    const today = new Date();
    const day = today.getDay();
    const mondayOffset = ((day + 6) % 7);
    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayOffset);
    const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const dates = {};
    days.forEach((d, idx) => {
      const dt = new Date(monday);
      dt.setDate(monday.getDate() + idx);
      dates[d] = dt;
    });
    return dates;
  };

  const isoDate = (date) => {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
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

    // Add to local draft only; publishing is a separate action
    const normalizedSection = (section || '').toUpperCase();
    const draft = {
      ...formData,
      year,
      section: normalizedSection,
      studentIds: students.map((s) => s.id),
      _localId: `${formData.day}_${(formData.periods || []).join('-')}_${formData.courseId}_${Date.now()}`,
    };
    setDraftEntries((prev) => [draft, ...prev]);
    setShowPreview(true);
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
  };

  const publishDraft = async () => {
    if (!department || !year || !section) {
      alert('Select Department, Year and Section first.');
      return;
    }
    if (draftEntries.length === 0) {
      alert('No draft entries to publish.');
      return;
    }
    setLoading(true);
    try {
      const normalizedSection = section.toUpperCase();
      const timetablePath = semesterKey
        ? timetableCollectionPathYearSem(department, semesterKey.toUpperCase(), normalizedSection)
        : timetableCollectionPathLegacy(year, normalizedSection);

      // We'll use a batch to record per-faculty and per-student indexes efficiently
      const batch = writeBatch(db);

      // Write all draft entries
      for (const entry of draftEntries) {
        const payload = {
          day: entry.day,
          periods: Array.isArray(entry.periods) && entry.periods.length > 0 ? entry.periods : ['1st'],
          startTime: entry.startTime,
          endTime: entry.endTime,
          room: entry.room || '',
          courseId: entry.courseId,
          facultyId: entry.facultyId,
        };
        await addDoc(collection(db, timetablePath), payload);

        // Attendance for each published entry (same as earlier logic)
        try {
          const weekDates = getWeekDates();
          const dateObj = weekDates[entry.day];
          if (dateObj) {
            let courseName = entry.courseId;
            try {
              if (semesterKey) {
                const ysRef = doc(db, courseDocPathYearSem(department, semesterKey.toUpperCase(), entry.courseId));
                const ysSnap = await getDoc(ysRef);
                if (ysSnap.exists()) {
                  const data = ysSnap.data();
                  courseName = data.courseName || data.title || entry.courseId;
                }
              } else {
                const secRef = doc(db, courseDocPath(department, year, normalizedSection, entry.courseId));
                const secSnap = await getDoc(secRef);
                if (secSnap.exists()) {
                  const data = secSnap.data();
                  courseName = data.courseName || data.title || entry.courseId;
                }
              }
            } catch (_) {}

            let studentIds = Array.isArray(entry.studentIds) ? entry.studentIds : [];
            try {
              const secCourseRef = semesterKey
                ? doc(db, courseDocPathYearSem(department, semesterKey.toUpperCase(), entry.courseId))
                : doc(db, courseDocPath(department, year, normalizedSection, entry.courseId));
              const scSnap = await getDoc(secCourseRef);
              if (scSnap.exists()) {
                const d = scSnap.data();
                const bySec = d.studentsBySection || {};
                const list = bySec[normalizedSection];
                if (Array.isArray(list)) studentIds = list;
              }
            } catch (_) {}

            const dateKey = isoDate(dateObj);
            const attDocPath = `attendance/${department}_${year}_${normalizedSection}/records/${dateKey}_${entry.courseId}`;
            const attRef = doc(db, attDocPath);
            await setDoc(attRef, {
              department,
              year,
              section: normalizedSection,
              date: dateKey,
              courseId: entry.courseId,
              courseName,
              facultyId: entry.facultyId,
              facultyName: faculty[entry.facultyId] || entry.facultyId,
              startTime: entry.startTime || null,
              endTime: entry.endTime || null,
              periods: entry.periods || [],
              room: entry.room || null,
              statusByStudent: Object.fromEntries((studentIds || []).map((id) => [id, 'pending'])),
              createdAt: new Date().toISOString(),
            }, { merge: true });

            // Index: per-faculty attendance pointer
            if (entry.facultyId) {
              const facIdxRef = doc(db, `faculty/${department}/members/${entry.facultyId}/attendance/${dateKey}_${entry.courseId}`);
              batch.set(facIdxRef, {
                department,
                year,
                section: normalizedSection,
                date: dateKey,
                courseId: entry.courseId,
                courseName,
                periods: entry.periods || [],
                room: entry.room || null,
                attendanceDocPath: attDocPath,
                createdAt: new Date().toISOString(),
              }, { merge: true });
            }

            // Index: per-student attendance pointer
            (studentIds || []).forEach((sid) => {
              const stuIdxRef = doc(db, `students_attendance/${sid}/records/${dateKey}_${entry.courseId}`);
              batch.set(stuIdxRef, {
                department,
                year,
                section: normalizedSection,
                date: dateKey,
                courseId: entry.courseId,
                courseName,
                facultyId: entry.facultyId,
                periods: entry.periods || [],
                room: entry.room || null,
                attendanceDocPath: attDocPath,
                status: 'pending',
                createdAt: new Date().toISOString(),
              }, { merge: true });
            });
          }
        } catch (_) {}
      }

      // Commit index batch
      try { await batch.commit(); } catch (_) {}

      // Clear draft and reload existing timetable
      setDraftEntries([]);
      const ttSnap = await getDocs(collection(db, timetablePath));
      const updatedTimetableData = ttSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setExistingTimetable(updatedTimetableData);
      alert('Published all draft entries successfully.');
    } catch (e) {
      console.error('Failed to publish drafts', e);
      alert('Failed to publish drafts.');
    } finally {
      setLoading(false);
    }
  };

  const clearDraft = () => {
    if (window.confirm('Clear all local draft entries?')) {
      setDraftEntries([]);
    }
  };

  const buildGridByDay = (entries) => {
    const map = {};
    daysOfWeek.forEach((d) => { map[d] = {}; });
    entries.forEach((e) => {
      (e.periods || []).forEach((p) => { map[e.day] && (map[e.day][p] = e); });
    });
    return map;
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="CSE_DS">CSE_DS</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
              </select>
            </div>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Semester (optional)</label>
              <select
                value={semesterKey}
                onChange={(e) => setSemesterKey(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="">Use legacy per-year</option>
                <option value="I_1">I_1</option>
                <option value="I_2">I_2</option>
                <option value="II_3">II_3</option>
                <option value="II_4">II_4</option>
                <option value="III_5">III_5</option>
                <option value="III_6">III_6</option>
                <option value="IV_7">IV_7</option>
                <option value="IV_8">IV_8</option>
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
                      disabled={Boolean(courses.find(c => c.id === formData.courseId)?.instructor)}
                    >
                      <option value="">Select Faculty</option>
                      {Object.entries(faculty).map(([id, name]) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ))}
                    </select>
                    {courses.find(c => c.id === formData.courseId)?.instructor && (
                      <p className="text-xs text-gray-500 mt-1">Auto-assigned from course</p>
                    )}
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="px-3 py-1 bg-purple-100 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors duration-200"
                    >
                      {showPreview ? 'Hide' : 'Show'} Preview
                    </button>
                    <button
                      onClick={publishDraft}
                      disabled={loading || draftEntries.length === 0}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 disabled:opacity-50"
                    >
                      Publish Week
                    </button>
                    <button
                      onClick={clearDraft}
                      disabled={draftEntries.length === 0}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50"
                    >
                      Clear Draft
                    </button>
                  </div>
                </div>

                {showPreview ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left">Day</th>
                          {periodsList.map((p, i) => (
                            <th key={p} className="px-4 py-2 text-center border-l">
                              <div className="text-xs text-gray-500 mb-1">{i + 1}</div>
                              <div className="text-[10px] text-gray-400">{timeSlots[i]?.start} - {timeSlots[i]?.end}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {daysOfWeek.map((day) => {
                          const grid = buildGridByDay([...existingTimetable, ...draftEntries]);
                          return (
                            <tr key={day} className="border-t">
                              <td className="px-4 py-2 font-semibold">{day}</td>
                              {periodsList.map((p, idx) => {
                                const e = grid[day][p];
                                return (
                                  <td key={p} className="px-2 py-2 text-center align-top border-l">
                                    {e ? (
                                      <div className="text-xs space-y-1">
                                        <div className="font-semibold">{courses.find(c => c.id === e.courseId)?.courseName || e.courseId}</div>
                                        <div className="text-gray-600">{faculty[e.facultyId] || e.facultyId}</div>
                                        <div className="text-gray-500">{e.room}</div>
                                      </div>
                                    ) : (
                                      <span className="text-gray-300 text-lg">—</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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

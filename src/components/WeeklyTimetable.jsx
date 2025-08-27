import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, getDoc, doc, updateDoc, deleteDoc, writeBatch, setDoc } from 'firebase/firestore';
import { FaCalendarAlt, FaSearch, FaEdit, FaTrash, FaSave, FaTimes, FaClock, FaMapMarkerAlt, FaUserTie, FaBook } from 'react-icons/fa';
import { coursesCollectionPath, courseDocPath, coursesCollectionPathYearSem, courseDocPathYearSem, timetableCollectionPathLegacy, timetableCollectionPathYearSem, possibleSemesterKeysForYear } from '../utils/pathBuilders';

const WeeklyTimetable = () => {
  const [department, setDepartment] = useState('CSE_DS');
  const [year, setYear] = useState('');
  const [semesterKey, setSemesterKey] = useState(''); // e.g., II_4
  const [section, setSection] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [courseMap, setCourseMap] = useState({});
  const [facultyMap, setFacultyMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ day: 'Monday', periods: [], startTime: '', endTime: '', room: '', courseId: '', facultyId: '' });

  const fetchTimetable = async () => {
    if (!department || !year || !section) {
      alert('Please select both year and section.');
      return;
    }

    setLoading(true);

    try {
      const path = semesterKey
        ? timetableCollectionPathYearSem(department, semesterKey, section)
        : timetableCollectionPathLegacy(year, section);
      const timetableSnapshot = await getDocs(collection(db, path));

      const timetableData = timetableSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log('Fetched Timetable:', timetableData);
      setTimetable(timetableData);

      const courseIds = new Set(timetableData.map((entry) => entry.courseId));
      const facultyIds = new Set(timetableData.map((entry) => entry.facultyId));

      const fetchedCourses = await fetchCourseDetails(courseIds, department, year, section, semesterKey);

      const fetchedFaculties = {};
      await Promise.all(
        [...facultyIds].map(async (facultyId) => {
          if (!facultyId) return;
          const facRef = doc(db, `faculty/${department}/members/${facultyId}`);
          const facSnap = await getDoc(facRef);
          if (facSnap.exists()) {
            const data = facSnap.data();
            fetchedFaculties[facultyId] = data.name || data.fullName || facultyId;
          } else {
            fetchedFaculties[facultyId] = facultyId;
          }
        })
      );

      console.log('Fetched Courses:', fetchedCourses);
      console.log('Fetched Faculties:', fetchedFaculties);

      setCourseMap(fetchedCourses);
      setFacultyMap(fetchedFaculties);
      // Ensure attendance sessions are generated for this week
      await ensureAttendanceForCurrentWeek(timetableData, department, year, section, fetchedCourses, fetchedFaculties, semesterKey);
    } catch (error) {
      console.error('Error fetching timetable:', error.message);
      alert('Failed to fetch timetable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetails = async (courseIds, department, year, section, semKey) => {
    const fetchedCourses = {};

    await Promise.all(
      [...courseIds].map(async (courseId) => {
        if (!courseId) return;
        if (semKey) {
          // New structure by year_sem
          const ysRef = doc(db, courseDocPathYearSem(department, semKey.toUpperCase(), courseId));
          const ysSnap = await getDoc(ysRef);
          if (ysSnap.exists()) {
            const data = ysSnap.data();
            fetchedCourses[courseId] = data.courseName || data.title || courseId;
            return;
          }
        }
        // If no semKey, try all possible keys for this year
        if (!semKey) {
          const possibles = possibleSemesterKeysForYear(year);
          for (const sk of possibles) {
            const ysRef = doc(db, courseDocPathYearSem(department, sk.toUpperCase(), courseId));
            const ysSnap = await getDoc(ysRef);
            if (ysSnap.exists()) {
              const data = ysSnap.data();
              fetchedCourses[courseId] = data.courseName || data.title || courseId;
              return;
            }
          }
        }
        // Prefer section-specific course doc (legacy per-section)
        const sectionCourseRef = doc(db, courseDocPath(department, year, section.toUpperCase(), courseId));
        const sectionCourseSnap = await getDoc(sectionCourseRef);
        if (sectionCourseSnap.exists()) {
          const data = sectionCourseSnap.data();
          fetchedCourses[courseId] = data.courseName || data.title || courseId;
          return;
        }
        // Fallback to ALL_SECTIONS catalog (legacy per-year)
        const allPath = coursesCollectionPath(department, year, 'ALL_SECTIONS');
        const fallbackRef = doc(db, allPath, courseId);
        const fbSnap = await getDoc(fallbackRef);
        if (fbSnap.exists()) {
          const data = fbSnap.data();
          fetchedCourses[courseId] = data.courseName || data.title || courseId;
        } else {
          fetchedCourses[courseId] = courseId;
        }
      })
    );

    return fetchedCourses;
  };

  const getWeekDates = () => {
    const today = new Date();
    const day = today.getDay(); // 0 Sun .. 6 Sat
    const mondayOffset = ((day + 6) % 7); // days since Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayOffset);
    // Build map: 'Monday' -> Date, ... 'Saturday' -> Date
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const dates = {};
    days.forEach((d, idx) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + idx);
      dates[d] = date;
    });
    return dates;
  };

  const isoDate = (date) => {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const ensureAttendanceForCurrentWeek = async (entries, department, year, section, courseNames, facultyNames, semKey) => {
    if (!Array.isArray(entries) || entries.length === 0) return;
    const weekDates = getWeekDates();
    const batch = writeBatch(db);

    // For each timetable entry, upsert an attendance session document for this week's corresponding day
    for (const entry of entries) {
      const day = (entry.day || '').trim();
      if (!weekDates[day]) continue;
      const dateObj = weekDates[day];
      const dateKey = isoDate(dateObj);

      const courseId = entry.courseId;
      const facultyId = entry.facultyId;
      const courseName = courseNames[courseId] || courseId;
      const facultyName = facultyNames[facultyId] || facultyId;

      // Try to fetch students linked to this course and section from course doc
      let studentIds = [];
      try {
        let courseSnap = null;
        if (semKey) {
          const ysRef = doc(db, courseDocPathYearSem(department, semKey.toUpperCase(), courseId));
          courseSnap = await getDoc(ysRef);
        }
        if (!courseSnap || !courseSnap.exists()) {
          const courseRef = doc(db, courseDocPath(department, year, section.toUpperCase(), courseId));
          courseSnap = await getDoc(courseRef);
        }
        if (courseSnap && courseSnap.exists()) {
          const data = courseSnap.data();
          const bySec = data.studentsBySection || {};
          const list = bySec[section.toUpperCase()];
          if (Array.isArray(list)) studentIds = list;
        }
      } catch (_) {}

      // Attendance doc path
      const attDocRef = doc(db, `attendance/${department}_${year}_${section.toUpperCase()}/${dateKey}_${courseId}`);
      batch.set(attDocRef, {
        department,
        year,
        section: section.toUpperCase(),
        date: dateKey,
        courseId,
        courseName,
        facultyId,
        facultyName,
        startTime: entry.startTime || null,
        endTime: entry.endTime || null,
        periods: entry.periods || [],
        room: entry.room || null,
        // Initialize status as pending, keyed by student id
        statusByStudent: Array.isArray(studentIds) ? Object.fromEntries(studentIds.map((id) => [id, 'pending'])) : {},
        createdAt: new Date().toISOString(),
      }, { merge: true });
    }

    try {
      await batch.commit();
    } catch (e) {
      console.warn('Failed to ensure attendance docs:', e);
    }
  };

  const organizeTimetableByDays = () => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timetableByDays = {};

    daysOfWeek.forEach((day) => {
      timetableByDays[day] = timetable.filter((entry) => entry.day.trim() === day);
    });

    return timetableByDays;
  };

  const organizedTimetable = organizeTimetableByDays();

  const handleEdit = (entry) => {
    setEditEntry(entry);
    setShowEditModal(true);
  };

  const handleDelete = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const path = semesterKey
          ? timetableCollectionPathYearSem(department, semesterKey, section)
          : timetableCollectionPathLegacy(year, section);
        await deleteDoc(doc(db, path, entryId));
        setTimetable((prev) => prev.filter((entry) => entry.id !== entryId));
        alert('Entry deleted successfully.');
      } catch (error) {
        console.error('Error deleting entry:', error.message);
        alert('Failed to delete entry.');
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editEntry) return;

    try {
      const { id, ...updatedEntry } = editEntry;
      const path = semesterKey
        ? timetableCollectionPathYearSem(department, semesterKey, section)
        : timetableCollectionPathLegacy(year, section);
      await updateDoc(doc(db, path, id), updatedEntry);
      setTimetable((prev) =>
        prev.map((entry) => (entry.id === id ? { ...entry, ...updatedEntry } : entry))
      );
      alert('Entry updated successfully.');
      setShowEditModal(false);
      setEditEntry(null);
    } catch (error) {
      console.error('Error updating entry:', error.message);
      alert('Failed to update entry.');
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

  const getPeriodColor = (periodIndex) => {
    const colors = [
      'bg-gradient-to-r from-blue-500 to-blue-600',
      'bg-gradient-to-r from-green-500 to-green-600',
      'bg-gradient-to-r from-purple-500 to-purple-600',
      'bg-gradient-to-r from-orange-500 to-orange-600',
      'bg-gradient-to-r from-pink-500 to-pink-600',
      'bg-gradient-to-r from-indigo-500 to-indigo-600',
      'bg-gradient-to-r from-teal-500 to-teal-600'
    ];
    return colors[periodIndex % colors.length];
  };

  const createTimetableEntry = async (e) => {
    e.preventDefault();
    if (!department || !year || !section) {
      alert('Please select department, year and section.');
      return;
    }
    if (!newEntry.courseId || !newEntry.facultyId || !newEntry.startTime || !newEntry.endTime || !newEntry.day) {
      alert('Please fill required fields: day, course, faculty, start/end time.');
      return;
    }
    try {
      const path = semesterKey
        ? timetableCollectionPathYearSem(department, semesterKey, section)
        : timetableCollectionPathLegacy(year, section);
      const entryRef = doc(collection(db, path));
      const payload = {
        day: newEntry.day,
        periods: Array.isArray(newEntry.periods) && newEntry.periods.length > 0 ? newEntry.periods : ['1st'],
        startTime: newEntry.startTime,
        endTime: newEntry.endTime,
        room: newEntry.room || '',
        courseId: newEntry.courseId,
        facultyId: newEntry.facultyId,
      };
      await setDoc(entryRef, payload);
      setShowCreateModal(false);
      setNewEntry({ day: 'Monday', periods: [], startTime: '', endTime: '', room: '', courseId: '', facultyId: '' });
      await fetchTimetable();
    } catch (err) {
      console.error('Failed to create timetable entry', err);
      alert('Failed to create timetable entry.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <FaCalendarAlt className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Weekly Timetable</h1>
              <p className="text-gray-600">Manage and view class schedules</p>
            </div>
          </div>
        </div>

        {/* Selection Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="">Select Section</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>

            <button
              onClick={fetchTimetable}
              disabled={!department || !year || !section || loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Loading...
                </>
              ) : (
                <>
                  <FaSearch />
                  Fetch Timetable
                </>
              )}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={!department || !year || !section}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl hover:from-green-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl"
            >
              <FaEdit />
              Create Entry
            </button>
          </div>
        </div>

        {/* Timetable Display */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading timetable...</p>
            </div>
          </div>
        ) : timetable.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 min-w-[120px]">
                      Day
                    </th>
                    {[...Array(7)].map((_, i) => (
                      <th key={i} className="px-4 py-4 text-center text-sm font-semibold text-gray-700 border-b border-gray-200 min-w-[200px]">
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-gray-500 mb-1">Period</span>
                          <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getPeriodColor(i)}`}>
                            {i + 1}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(organizedTimetable).map(([day, entries]) => (
                    <tr key={day} className={`${getDayColor(day)} hover:bg-gray-50 transition-colors duration-200`}>
                      <td className="px-6 py-4 border-b border-gray-200">
                        <div className="font-bold text-gray-800">{day}</div>
                      </td>
                      {[...Array(7)].map((_, periodIndex) => {
                        const entry = entries.find((e) =>
                          e.periods.some((p) => p === `${periodIndex + 1}st` || p === `${periodIndex + 1}nd` || p === `${periodIndex + 1}rd`)
                        );
                        return (
                          <td key={periodIndex} className="px-4 py-4 border-b border-gray-200">
                            {entry ? (
                              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <FaBook className="text-blue-500 text-sm" />
                                    <span className="font-semibold text-gray-800 text-sm">
                                      {courseMap[entry.courseId] || entry.courseId}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <FaUserTie className="text-green-500 text-sm" />
                                    <span className="text-gray-600 text-sm">
                                      {facultyMap[entry.facultyId] || entry.facultyId}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-purple-500 text-sm" />
                                    <span className="text-gray-600 text-sm">{entry.room}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <FaClock className="text-orange-500 text-sm" />
                                    <span className="text-gray-600 text-sm">
                                      {entry.startTime} - {entry.endTime}
                                    </span>
                                  </div>
                                  
                                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                                    <button
                                      onClick={() => handleEdit(entry)}
                                      className="flex-1 px-2 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors duration-200 flex items-center justify-center gap-1"
                                    >
                                      <FaEdit className="text-xs" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete(entry.id)}
                                      className="flex-1 px-2 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors duration-200 flex items-center justify-center gap-1"
                                    >
                                      <FaTrash className="text-xs" />
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-400">
                                <div className="text-2xl mb-2">—</div>
                                <div className="text-xs">No Class</div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : year && section ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Timetable Found</h3>
              <p className="text-gray-500">No timetable entries found for Year {year}, Section {section}</p>
            </div>
          </div>
        ) : null}

        {/* Edit Modal */}
        {showEditModal && editEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Edit Timetable Entry</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Room</label>
                  <input
                    type="text"
                    placeholder="Enter room number"
                    value={editEntry.room}
                    onChange={(e) =>
                      setEditEntry((prev) => ({ ...prev, room: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={editEntry.startTime}
                      onChange={(e) =>
                        setEditEntry((prev) => ({ ...prev, startTime: e.target.value }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      value={editEntry.endTime}
                      onChange={(e) =>
                        setEditEntry((prev) => ({ ...prev, endTime: e.target.value }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                  >
                    <FaSave />
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Create Timetable Entry</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={createTimetableEntry} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Day</label>
                    <select
                      value={newEntry.day}
                      onChange={(e) => setNewEntry((p) => ({ ...p, day: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Room</label>
                    <input
                      type="text"
                      value={newEntry.room}
                      onChange={(e) => setNewEntry((p) => ({ ...p, room: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={newEntry.startTime}
                      onChange={(e) => setNewEntry((p) => ({ ...p, startTime: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      value={newEntry.endTime}
                      onChange={(e) => setNewEntry((p) => ({ ...p, endTime: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Course</label>
                    <input
                      type="text"
                      placeholder="Enter Course ID"
                      value={newEntry.courseId}
                      onChange={(e) => setNewEntry((p) => ({ ...p, courseId: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Faculty</label>
                    <input
                      type="text"
                      placeholder="Enter Faculty ID"
                      value={newEntry.facultyId}
                      onChange={(e) => setNewEntry((p) => ({ ...p, facultyId: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl hover:from-green-600 hover:to-teal-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                  >
                    <FaSave />
                    Create Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyTimetable;

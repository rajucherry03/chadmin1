import React, { useEffect, useState, useCallback, useMemo } from "react";
import studentApiService from '../services/studentApiService';
import { 
  FaSearch, 
  FaFilter, 
  FaRefresh, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaBookOpen,
  FaUserTie,
  FaGraduationCap,
  FaTimes,
  FaSave,
  FaExclamationTriangle
} from "react-icons/fa";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("ALL");
  const [filterSection, setFilterSection] = useState("ALL");

  // Memoized path builder for better performance
  const getCoursePath = useCallback((year, section) => {
    return `courses/CSE_DS/years/${year}/sections/${section}/courseDetails`;
  }, []);

  // Optimized data fetching with better error handling
  const fetchCoursesAndInstructors = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const years = ["I", "II", "III", "IV"];
      const sections = ["ALL_SECTIONS"]; // Using ALL_SECTIONS as per the path structure

      let coursesList = [];
      const instructorIds = new Set();

      // Fetch courses with optimized queries
      const fetchPromises = years.map(async (year) => {
        const sectionPromises = sections.map(async (section) => {
          try {
            const courseQuery = query(
              collection(db, getCoursePath(year, section)),
              orderBy("courseCode"),
              limit(100) // Limit to prevent overwhelming data
            );
            
            const querySnapshot = await getDocs(courseQuery);
            const sectionCourses = querySnapshot.docs.map((doc) => {
              const data = doc.data();
              if (data.instructor) {
                instructorIds.add(data.instructor);
              }
              return {
                id: doc.id,
                year,
                section,
                ...data,
              };
            });
            return sectionCourses;
          } catch (error) {
            console.warn(`Error fetching courses for year ${year}, section ${section}:`, error);
            return [];
          }
        });

        const sectionResults = await Promise.all(sectionPromises);
        return sectionResults.flat();
      });

      const yearResults = await Promise.all(fetchPromises);
      coursesList = yearResults.flat();

      // Fetch instructors in parallel with optimized batching
      const instructorData = {};
      const instructorFetchPromises = Array.from(instructorIds).map(async (id) => {
        if (id) {
          try {
            const docRef = doc(db, "faculty", id);
            const instructorSnapshot = await getDoc(docRef);
            if (instructorSnapshot.exists()) {
              instructorData[id] = instructorSnapshot.data().name;
            }
          } catch (error) {
            console.warn(`Error fetching instructor ${id}:`, error);
          }
        }
      });

      await Promise.all(instructorFetchPromises);

      setCourses(coursesList);
      setInstructors(instructorData);
    } catch (error) {
      console.error("Error fetching courses or instructors:", error);
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [getCoursePath]);

  useEffect(() => {
    fetchCoursesAndInstructors();
  }, [fetchCoursesAndInstructors]);

  // Memoized filtered courses for better performance
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = 
        course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructors[course.instructor]?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesYear = filterYear === "ALL" || course.year === filterYear;
      const matchesSection = filterSection === "ALL" || course.section === filterSection;
      
      return matchesSearch && matchesYear && matchesSection;
    });
  }, [courses, searchTerm, filterYear, filterSection, instructors]);

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setIsViewing(true);
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setIsEditing(true);
  };

  const handleDeleteCourse = async (course) => {
    if (window.confirm(`Are you sure you want to delete the course: ${course.courseName}?`)) {
      try {
        const courseRef = doc(db, getCoursePath(course.year, course.section), course.id);
        await deleteDoc(courseRef);

        setCourses((prevCourses) =>
          prevCourses.filter((existingCourse) => existingCourse.id !== course.id)
        );
        alert("Course deleted successfully!");
      } catch (error) {
        console.error("Error deleting course:", error);
        alert("Failed to delete the course. Please try again.");
      }
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedCourse) return;

    try {
      const courseRef = doc(db, getCoursePath(selectedCourse.year, selectedCourse.section), selectedCourse.id);
      await updateDoc(courseRef, {
        courseName: selectedCourse.courseName,
        courseCode: selectedCourse.courseCode,
        coveragePercentage: selectedCourse.coveragePercentage || "N/A",
        syllabusCoverage: selectedCourse.syllabusCoverage || "N/A",
        unitsCompleted: selectedCourse.unitsCompleted || "N/A",
        deviationReasons: selectedCourse.deviationReasons || "N/A",
      });

      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === selectedCourse.id ? selectedCourse : course
        )
      );

      setIsEditing(false);
      alert("Course updated successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to update course. Please try again.");
    }
  };

  // Loading component
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading courses...</p>
        </div>
      </div>
    );
  }

  // Error component
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-red-600 dark:text-red-400 text-6xl mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchCoursesAndInstructors}
            className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-all duration-300">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Course Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and view course details, instructors, and academic progress
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses, codes, or instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                <option value="ALL">All Years</option>
                <option value="I">I Year</option>
                <option value="II">II Year</option>
                <option value="III">III Year</option>
                <option value="IV">IV Year</option>
              </select>
            </div>
            <div>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                <option value="ALL">All Sections</option>
                <option value="ALL_SECTIONS">All Sections</option>
              </select>
            </div>
            <div>
              <button
                onClick={fetchCoursesAndInstructors}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 dark:bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
              >
                <FaRefresh className="text-sm" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredCourses.length} of {courses.length} courses
        </div>

        {/* Courses List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={`${course.year}-${course.section}-${course.id}`}
              className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/20 rounded-xl p-6 hover:shadow-xl dark:hover:shadow-gray-900/30 transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {course.courseCode}
                </h2>
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs px-2 py-1 rounded-full font-medium">
                  {course.year} Year
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-3 line-clamp-2">
                {course.courseName}
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <FaGraduationCap className="text-gray-400" />
                  <span>Section: {course.section}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <FaUserTie className="text-gray-400" />
                  <span>Instructor: {instructors[course.instructor] || "Not Assigned"}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <FaBookOpen className="text-gray-400" />
                  <span>Coverage: {course.coveragePercentage || "N/A"}</span>
                </div>
              </div>
              <div className="flex justify-between gap-2">
                <button
                  onClick={() => handleViewDetails(course)}
                  className="flex-1 flex items-center justify-center space-x-1 bg-blue-600 dark:bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm transition-colors"
                >
                  <FaEye className="text-xs" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => handleEditCourse(course)}
                  className="flex-1 flex items-center justify-center space-x-1 bg-yellow-500 dark:bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 dark:hover:bg-yellow-700 text-sm transition-colors"
                >
                  <FaEdit className="text-xs" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteCourse(course)}
                  className="flex-1 flex items-center justify-center space-x-1 bg-red-500 dark:bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-600 dark:hover:bg-red-700 text-sm transition-colors"
                >
                  <FaTrash className="text-xs" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <FaBookOpen className="text-gray-400 dark:text-gray-500 text-6xl mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
              {searchTerm || filterYear !== "ALL" || filterSection !== "ALL" 
                ? "No courses match your filters." 
                : "No courses found. Please add some data in Firebase."}
            </p>
            {(searchTerm || filterYear !== "ALL" || filterSection !== "ALL") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterYear("ALL");
                  setFilterSection("ALL");
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* View Modal */}
      {isViewing && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Course Details</h2>
              <button
                onClick={() => setIsViewing(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
              >
                <FaTimes />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Course Name</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedCourse.courseName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Course Code</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedCourse.courseCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Year</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedCourse.year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Section</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedCourse.section}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Instructor</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{instructors[selectedCourse.instructor] || "N/A"}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Coverage Percentage</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedCourse.coveragePercentage || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Syllabus Coverage</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedCourse.syllabusCoverage || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Units Completed</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedCourse.unitsCompleted || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Deviation Reasons</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedCourse.deviationReasons || "N/A"}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsViewing(false)}
              className="mt-6 bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Course</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
              >
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              {Object.entries(selectedCourse).map(([key, value]) => {
                // Exclude fields that shouldn't be edited
                if (key === "id" || key === "year" || key === "section") {
                  return (
                    <div key={key}>
                      <label className="block font-semibold mb-2 capitalize text-gray-900 dark:text-white">
                        {key === "year" ? "Year" : key === "section" ? "Section" : key}
                      </label>
                      <input
                        type="text"
                        value={value}
                        disabled
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      />
                    </div>
                  );
                }
                return (
                  <div key={key}>
                    <label className="block font-semibold mb-2 capitalize text-gray-900 dark:text-white">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </label>
                    <input
                      type="text"
                      name={key}
                      value={value || ""}
                      onChange={(e) =>
                        setSelectedCourse((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="flex items-center space-x-2 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                <FaSave className="text-sm" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Courses;

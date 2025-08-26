import React, { useEffect, useState, useCallback, useMemo } from "react";
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";

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
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  // Error component
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchCoursesAndInstructors}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          Course Details
        </h1>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search courses, codes, or instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Years</option>
                <option value="I">I Year</option>
                <option value="II">II Year</option>
                <option value="III">III Year</option>
                <option value="IV">IV Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Sections</option>
                <option value="ALL_SECTIONS">All Sections</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchCoursesAndInstructors}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredCourses.length} of {courses.length} courses
        </div>

        {/* Courses List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={`${course.year}-${course.section}-${course.id}`}
              className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-all duration-200 border-l-4 border-blue-500"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold text-gray-700">
                  {course.courseCode}
                </h2>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {course.year} Year
                </span>
              </div>
              <p className="text-gray-600 font-medium mb-2 line-clamp-2">
                {course.courseName}
              </p>
              <p className="text-gray-500 text-sm mb-2">
                <strong>Section:</strong> {course.section}
              </p>
              <p className="text-gray-500 text-sm mb-2">
                <strong>Instructor:</strong>{" "}
                {instructors[course.instructor] || "Not Assigned"}
              </p>
              <p className="text-gray-500 text-sm mb-3">
                <strong>Coverage:</strong>{" "}
                {course.coveragePercentage || "N/A"}
              </p>
              <div className="flex justify-between gap-2">
                <button
                  onClick={() => handleViewDetails(course)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm transition-colors"
                >
                  View
                </button>
                <button
                  onClick={() => handleEditCourse(course)}
                  className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded-md hover:bg-yellow-600 text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCourse(course)}
                  className="flex-1 bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <p className="text-gray-600 text-lg mb-2">
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
                className="text-blue-600 hover:text-blue-800 underline"
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
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Course Details</h2>
              <button
                onClick={() => setIsViewing(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="mb-2"><strong>Course Name:</strong> {selectedCourse.courseName}</p>
                <p className="mb-2"><strong>Course Code:</strong> {selectedCourse.courseCode}</p>
                <p className="mb-2"><strong>Year:</strong> {selectedCourse.year}</p>
                <p className="mb-2"><strong>Section:</strong> {selectedCourse.section}</p>
                <p className="mb-2"><strong>Instructor:</strong> {instructors[selectedCourse.instructor] || "N/A"}</p>
              </div>
              <div>
                <p className="mb-2"><strong>Coverage Percentage:</strong> {selectedCourse.coveragePercentage || "N/A"}</p>
                <p className="mb-2"><strong>Syllabus Coverage:</strong> {selectedCourse.syllabusCoverage || "N/A"}</p>
                <p className="mb-2"><strong>Units Completed:</strong> {selectedCourse.unitsCompleted || "N/A"}</p>
                <p className="mb-2"><strong>Deviation Reasons:</strong> {selectedCourse.deviationReasons || "N/A"}</p>
              </div>
            </div>
            <button
              onClick={() => setIsViewing(false)}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Edit Course</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              {Object.entries(selectedCourse).map(([key, value]) => {
                // Exclude fields that shouldn't be edited
                if (key === "id" || key === "year" || key === "section") {
                  return (
                    <div key={key}>
                      <label className="block font-semibold mb-1 capitalize">
                        {key === "year" ? "Year" : key === "section" ? "Section" : key}
                      </label>
                      <input
                        type="text"
                        value={value}
                        disabled
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                      />
                    </div>
                  );
                }
                return (
                  <div key={key}>
                    <label className="block font-semibold mb-1 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </label>
                    <input
                      type="text"
                      name={key}
                      value={value || ""}
                      onChange={(e) =>
                        setSelectedCourse((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Courses;

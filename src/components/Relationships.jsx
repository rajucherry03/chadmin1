import React, { useState, useEffect, useMemo } from "react";
import { collection, getDocs, doc, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import {
  studentsCollectionPath,
  studentDocPath,
  coursesCollectionPath,
  courseDocPath,
} from "../utils/pathBuilders";

function Relationships() {
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  // Use short department codes to match database layout
  const [selectedDepartment, setSelectedDepartment] = useState("CSE_DS");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch faculty for selected department
  useEffect(() => {
    const fetchFaculty = async () => {
      if (!selectedDepartment) return;
      try {
        const snap = await getDocs(collection(db, `faculty/${selectedDepartment}/members`));
        setFaculty(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Error fetching faculty:", e);
        setFaculty([]);
      }
    };
    fetchFaculty();
  }, [selectedDepartment]);

  // Fetch Data Based on Department, Year and Section
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedDepartment || !selectedYear || !selectedSection) {
        console.log("Year or Section not selected yet.");
        return;
      }

      setIsLoading(true);

      try {
        const normalizedSection = selectedSection.toUpperCase();

        const studentsPath = studentsCollectionPath(selectedDepartment, selectedYear, normalizedSection);
        const coursesPath = coursesCollectionPath(selectedDepartment, selectedYear, normalizedSection);

        const [studentsSnapshot, coursesSnapshot] = await Promise.all([
          getDocs(collection(db, studentsPath)).catch(() => ({ docs: [] })),
          getDocs(collection(db, coursesPath)).catch(() => ({ docs: [] })),
        ]);

        const studentsData = studentsSnapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.rollNo && b.rollNo ? a.rollNo.localeCompare(b.rollNo) : 0));
        setStudents(studentsData);

        let coursesData = coursesSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Fallback: try ALL_SECTIONS if specific section is empty
        if (coursesData.length === 0 && normalizedSection !== "ALL_SECTIONS") {
          const allSecSnap = await getDocs(
            collection(db, coursesCollectionPath(selectedDepartment, selectedYear, "ALL_SECTIONS"))
          ).catch(() => ({ docs: [] }));
          coursesData = allSecSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        }
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Backward compatibility for legacy student paths: students/{year}/{section}
        try {
          const legacyStudentsSnap = await getDocs(
            collection(db, `students/${selectedYear}/${normalizedSection}`)
          );
          const legacyStudents = legacyStudentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
          if (legacyStudents.length > 0) setStudents(legacyStudents);
        } catch {}
      }

      setIsLoading(false);
    };

    fetchData();
  }, [selectedDepartment, selectedYear, selectedSection]);

  // Handle selecting or deselecting individual students
  const handleStudentSelection = (studentId) => {
    setSelectedStudents((prevSelected) =>
      prevSelected.includes(studentId)
        ? prevSelected.filter((id) => id !== studentId) // Deselect if already selected
        : [...prevSelected, studentId] // Select if not already selected
    );
  };

  // Handle "Select All" or "Deselect All"
  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      // If all are selected, deselect all
      setSelectedStudents([]);
    } else {
      // Otherwise, select all
      setSelectedStudents(students.map((student) => student.id));
    }
  };

  const assignRelationships = async () => {
    if (!selectedYear || !selectedSection || !selectedCourse || !selectedFaculty || selectedStudents.length === 0) {
      alert("Please select year, section, course, faculty, and at least one student.");
      return;
    }

    setIsLoading(true);

    try {
      const batch = writeBatch(db);

      // Update only selected students
      selectedStudents.forEach((studentId) => {
        const studentRef = doc(
          db,
          studentDocPath(selectedDepartment, selectedYear, selectedSection, studentId)
        );
        const student = students.find((s) => s.id === studentId);
        if (student) {
          const updatedCourses = student.courses
            ? [...new Set([...student.courses, selectedCourse])]
            : [selectedCourse];
          batch.update(studentRef, { courses: updatedCourses });
        }
      });

      // Update the faculty with the assigned course
      const facultyRef = doc(db, `faculty/${selectedDepartment}/members/${selectedFaculty}`);
      const facultyDoc = faculty.find((fac) => fac.id === selectedFaculty);
      if (facultyDoc) {
        const updatedFacultyCourses = facultyDoc.courses
          ? [...new Set([...facultyDoc.courses, selectedCourse])]
          : [selectedCourse];
        batch.update(facultyRef, { courses: updatedFacultyCourses });
      }

      // Update the course with the selected students
      const courseRef = doc(
        db,
        courseDocPath(selectedDepartment, selectedYear, selectedSection, selectedCourse)
      );
      batch.update(courseRef, {
        instructor: selectedFaculty,
        students: selectedStudents,
      });

      await batch.commit();
      alert("Relationships successfully assigned for selected students!");
    } catch (error) {
      console.error("Error assigning relationships:", error);
      alert("An error occurred while assigning relationships.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          Assign Faculty to Course and Students
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center">
            <div className="loader border-t-4 border-blue-600 border-solid rounded-full w-12 h-12 animate-spin"></div>
            <p className="ml-4 text-lg text-gray-700">Loading...</p>
          </div>
        ) : (
          <div className="space-y-4 bg-white shadow-lg rounded-lg p-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Select Department</h2>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
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
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Select Year</h2>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">-- Select a Year --</option>
                <option value="IV">IV</option>
                <option value="III">III</option>
                <option value="II">II</option>
              </select>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Select Section</h2>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">-- Select a Section --</option>
                <option value="ALL_SECTIONS">ALL_SECTIONS</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>

            {students.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                  Select Students
                </h2>
                <button
                  onClick={handleSelectAll}
                  className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {selectedStudents.length === students.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
                <div className="space-y-2">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={student.id}
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleStudentSelection(student.id)}
                      />
                      <label htmlFor={student.id}>
                        {student.rollNo
                          ? `${student.rollNo} - ${student.name || `Student ${student.id}`}`
                          : `Student ID: ${student.id}`}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Select Course</h2>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                disabled={courses.length === 0}
              >
                <option value="">-- Select a Course --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.courseCode} - {course.courseName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Select Faculty</h2>
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                disabled={faculty.length === 0}
              >
                <option value="">-- Select Faculty --</option>
                {faculty.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name} ({fac.designation})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={assignRelationships}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200"
            >
              Assign Relationships
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Relationships;

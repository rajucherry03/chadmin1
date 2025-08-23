import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { auth } from "./firebase"; // Import Firebase auth
import { queryClient } from "./utils/queryClient";
import { LoadingSpinner } from "./components/LazyComponent";
import "./utils/fonts"; // Import font optimizations
const AdminNavbar = lazy(() => import("./components/Navbar.jsx"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard.jsx"));
const Login = lazy(() => import("./components/Login.jsx"));
const Students = lazy(() => import("./components/StudentManagement/StudentDashboard.jsx"));
const AddStudent = lazy(() => import("./components/AddStudent.jsx"));
const StudentRegistration = lazy(() => import("./components/StudentRegistration.jsx"));
const FormCustomizer = lazy(() => import("./components/FormCustomizer.jsx"));
const Faculty = lazy(() => import("./components/Faculty-manage.jsx"));
const AddFaculty = lazy(() => import("./components/AddFaculty.jsx"));
const AddCourse = lazy(() => import("./components/AddCourse.jsx"));
const Courses = lazy(() => import("./components/Courses.jsx"));
const Relationships = lazy(() => import("./components/Relationships.jsx"));
const FacultyAssignments = lazy(() => import("./components/FacultyAssignments.jsx"));
const NoDues = lazy(() => import("./components/NoDues.jsx"));
const NoDuesManagement = lazy(() => import("./components/NoDuesManagement.jsx"));
const WeeklyTimetable = lazy(() => import("./components/WeeklyTimetable.jsx"));
const CreateTimetable = lazy(() => import("./components/CreateTImeTable.jsx"));
const CreateUser = lazy(() => import("./components/CreateUser.jsx"));
const Attendance = lazy(() => import("./components/Attendance.jsx"));
const CoordinatorAssignment = lazy(() => import("./components/CoordinatorAssignment.jsx"));
const MentorAssignment = lazy(() => import("./components/MentorAssignment.jsx"));
const ManageMentors = lazy(() => import("./components/ManageMentors.jsx"));
const MakeAdmin = lazy(() => import("./components/MakeAdmin.jsx"));
const UserList = lazy(() => import("./components/UserList.jsx"));
const NoduesCURD = lazy(() => import("./components/NoduesCURD.jsx"));

// Private Route Wrapper
const PrivateRoute = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthenticated(!!user);
      setLoading(false);
    });
    return () => unsubscribe(); // Cleanup subscription
  }, []);

  if (loading) {
    return <div className="text-center mt-10"><LoadingSpinner size="lg" /></div>;
  }

  return authenticated ? children : <Navigate to="/" />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={
            <Suspense fallback={<div className="p-4"><LoadingSpinner /></div>}>
              <Login />
            </Suspense>
          } />
          <Route
            path="*"
            element={
              <PrivateRoute>
                <Suspense fallback={<div className="p-4"><LoadingSpinner /></div>}>
                  <AdminNavbar />
                  <div className="p-4">
                    <Routes>
                      <Route path="/dashboard" element={<AdminDashboard />} />
                      <Route path="/students" element={<Students />} />
                      <Route path="/home" element={<Students />} />
                      <Route path="/addstudent" element={<AddStudent />} />
                      <Route path="/student-registration" element={<StudentRegistration />} />
                      <Route path="/form-customizer" element={<FormCustomizer />} />
                      <Route path="/faculty" element={<Faculty />} />
                      <Route path="/addfaculty" element={<AddFaculty />} />
                      <Route path="/addcourse" element={<AddCourse />} />
                      <Route path="/courses" element={<Courses />} />
                      <Route path="/relationships" element={<Relationships />} />
                      <Route path="/facultyassignments" element={<FacultyAssignments />} />
                      <Route path="/nodues" element={<NoDues />} />
                      <Route path="/noduesmanagement" element={<NoDuesManagement />} />
                      <Route path="/weeklytimetable" element={<WeeklyTimetable />} />
                      <Route path="/createtimetable" element={<CreateTimetable />} />
                      <Route path="/createuser" element={<CreateUser />} />
                      <Route path="/attendance" element={<Attendance />} />
                      <Route path="/coordinator" element={<CoordinatorAssignment />} />
                      <Route path="/mentor" element={<MentorAssignment />} />
                      <Route path="/managementors" element={<ManageMentors />} />
                      <Route path="/make-admin" element={<MakeAdmin />} />
                      <Route path="/list-users" element={<UserList />} />
                      <Route path="/noduecurd" element={<NoduesCURD />} />
                    </Routes>
                  </div>
                </Suspense>
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;



import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { auth } from "./firebase"; // Import Firebase auth
import { queryClient } from "./utils/queryClient";
import { LoadingSpinner } from "./components/LazyComponent";
import ErrorBoundary from "./components/ErrorBoundary";
import OfflineIndicator from "./components/OfflineIndicator";
import "./utils/fonts"; // Import font optimizations
const AdminNavbar = lazy(() => import("./components/Navbar.jsx"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard.jsx"));
const Login = lazy(() => import("./components/Login.jsx"))
const Students = lazy(() => import("./components/StudentManagement/StudentDashboard.jsx"));
const StudentManagement = lazy(() => import("./components/StudentManagement.jsx"));
const StudentRegistration = lazy(() => import("./components/StudentRegistration.jsx"));
const FormCustomizer = lazy(() => import("./components/FormCustomizer.jsx"));
const Faculty = lazy(() => import("./components/Faculty-manage.jsx"));
const FacultyManagement = lazy(() => import("./components/FacultyManagement.jsx"));
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
const FeeManagement = lazy(() => import("./components/FeeManagement.jsx"));
const FeeStructureManager = lazy(() => import("./components/FeeStructureManager.jsx"));
const PaymentManager = lazy(() => import("./components/PaymentManager.jsx"));
const FeeReports = lazy(() => import("./components/FeeReports.jsx"));
const AutoFeeCalculator = lazy(() => import("./components/AutoFeeCalculator.jsx"));
const InstallmentManager = lazy(() => import("./components/InstallmentManager.jsx"));
const ScholarshipManager = lazy(() => import("./components/ScholarshipManager.jsx"));
const TransportManagement = lazy(() => import("./components/TransportManagement.jsx"));
const HostelManagement = lazy(() => import("./components/HostelManagement.jsx"));
const SyllabusManagement = lazy(() => import("./components/SyllabusManagement/SyllabusManagement.jsx"));
const ProgramManagement = lazy(() => import("./components/SyllabusManagement/ProgramManagement.jsx"));
const CourseManagement = lazy(() => import("./components/SyllabusManagement/CourseManagement.jsx"));
const SyllabusEditor = lazy(() => import("./components/SyllabusManagement/SyllabusEditor.jsx"));
const CLOPOMapping = lazy(() => import("./components/SyllabusManagement/CLOPOMapping.jsx"));
const ApprovalWorkflow = lazy(() => import("./components/SyllabusManagement/ApprovalWorkflow.jsx"));
const GradesManagement = lazy(() => import("./components/GradesManagement/GradesManagement.jsx"));
const EventManagement = lazy(() => import("./components/EventManagement/EventManagement.jsx"));

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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <OfflineIndicator />
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
                    <div className="flex min-h-screen bg-gray-100">
                      <AdminNavbar />
                      <div className="flex-1 transition-all duration-300">
                        <div className="p-4 lg:p-6">
                          <Routes>
                            <Route path="/dashboard" element={<AdminDashboard />} />
                            <Route path="/home" element={<Students />} />
                            <Route path="/student-management" element={<StudentManagement />} />
                            <Route path="/student-registration" element={<StudentRegistration />} />
                            <Route path="/form-customizer" element={<FormCustomizer />} />
                            <Route path="/faculty" element={<FacultyManagement />} />
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
                            <Route path="/fee-management" element={<FeeManagement />} />
                            <Route path="/fee-structures" element={<FeeStructureManager />} />
                            <Route path="/payment-manager" element={<PaymentManager />} />
                            <Route path="/fee-reports" element={<FeeReports />} />
                            <Route path="/auto-fee-calculator" element={<AutoFeeCalculator />} />
                            <Route path="/installment-manager" element={<InstallmentManager />} />
                            <Route path="/scholarship-manager" element={<ScholarshipManager />} />
                            <Route path="/transport-management" element={<TransportManagement />} />
                            <Route path="/hostel-management/*" element={<HostelManagement />} />
                            <Route path="/syllabus-management" element={<SyllabusManagement />} />
                            <Route path="/program-management" element={<ProgramManagement />} />
                            <Route path="/course-management" element={<CourseManagement />} />
                            <Route path="/syllabus-editor" element={<SyllabusEditor />} />
                            <Route path="/clo-po-mapping" element={<CLOPOMapping />} />
                            <Route path="/approval-workflow" element={<ApprovalWorkflow />} />
                            <Route path="/grades-management" element={<GradesManagement />} />
                            <Route path="/event-management" element={<EventManagement />} />
                          </Routes>
                        </div>
                      </div>
                    </div>
                  </Suspense>
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;



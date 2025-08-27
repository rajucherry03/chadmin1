import React, { Suspense, lazy, useState } from "react";
import { Link, Routes, Route, useLocation, Navigate } from "react-router-dom";

const Projects = lazy(() => import("./projects/Projects.jsx"));
const Grants = lazy(() => import("./grants/Grants.jsx"));
const Publications = lazy(() => import("./publications/Publications.jsx"));
const PublicationsDetail = lazy(() => import("./publications/PublicationsDetail.jsx"));
const PaidJournals = lazy(() => import("./publications/PaidJournals.jsx"));
const StudentPublications = lazy(() => import("./publications/StudentPublications.jsx"));
const UGCPublications = lazy(() => import("./publications/UGCPublications.jsx"));
const Patents = lazy(() => import("./patents/Patents.jsx"));
const Collaborations = lazy(() => import("./collaborations/Collaborations.jsx"));
const Students = lazy(() => import("./students/Students.jsx"));
const Conferences = lazy(() => import("./conferences/Conferences.jsx"));
const Analytics = lazy(() => import("./analytics/Analytics.jsx"));
const Integrations = lazy(() => import("./integrations/Integrations.jsx"));
const FacultyOutputs = lazy(() => import("./faculty/FacultyOutputs.jsx"));

const TabLink = ({ to, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        isActive ? "bg-orange-500 text-white" : "bg-white text-gray-700 border"
      }`}
    >
      {label}
    </Link>
  );
};

const ResearchDevelopment = () => {
  const base = "/research-development";
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <TabLink to={`${base}/projects`} label="Projects" />
        <TabLink to={`${base}/grants`} label="Grants" />
        <TabLink to={`${base}/publications`} label="Publications" />
        <TabLink to={`${base}/publications-details`} label="Publication Details" />
        <TabLink to={`${base}/paid-journals`} label="Paid Journals" />
        <TabLink to={`${base}/student-publications`} label="Student Publications" />
        <TabLink to={`${base}/ugc-publications`} label="UGC Publications" />
        <TabLink to={`${base}/patents`} label="Patents" />
        <TabLink to={`${base}/collaborations`} label="Collaborations" />
        <TabLink to={`${base}/students`} label="Student Research" />
        <TabLink to={`${base}/conferences`} label="Conferences" />
        <TabLink to={`${base}/faculty-outputs`} label="Faculty Outputs" />
        <TabLink to={`${base}/analytics`} label="Analytics" />
        <TabLink to={`${base}/integrations`} label="Integrations" />
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <Suspense fallback={<div className="p-4">Loading...</div>}>
          <Routes>
            <Route path="/projects/*" element={<Projects />} />
            <Route path="/grants" element={<Grants />} />
            <Route path="/publications" element={<Publications />} />
            <Route path="/publications-details" element={<PublicationsDetail />} />
            <Route path="/paid-journals" element={<PaidJournals />} />
            <Route path="/student-publications" element={<StudentPublications />} />
            <Route path="/ugc-publications" element={<UGCPublications />} />
            <Route path="/patents" element={<Patents />} />
            <Route path="/collaborations" element={<Collaborations />} />
            <Route path="/students" element={<Students />} />
            <Route path="/conferences" element={<Conferences />} />
            <Route path="/faculty-outputs" element={<FacultyOutputs />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="*" element={<Navigate to={`${base}/projects`} replace />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
};

export default ResearchDevelopment;



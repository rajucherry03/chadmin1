import React, { lazy, Suspense } from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import { LoadingSpinner } from "../LazyComponent";

const FeedbackOverview = lazy(() => import("./FeedbackOverview.jsx"));
const FeedbackBuilder = lazy(() => import("./FeedbackBuilder.jsx"));
const FeedbackDistribute = lazy(() => import("./FeedbackDistribute.jsx"));
const FeedbackResponses = lazy(() => import("./FeedbackResponses.jsx"));
const FeedbackAnalytics = lazy(() => import("./FeedbackAnalytics.jsx"));
const FeedbackActions = lazy(() => import("./FeedbackActions.jsx"));
const FeedbackSettings = lazy(() => import("./FeedbackSettings.jsx"));

const TabLink = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        isActive ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      } border`
    }
  >
    {label}
  </NavLink>
);

const FeedbackManagement = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Feedback Management</h1>
      </div>

      <div className="flex gap-2 flex-wrap bg-white p-2 rounded-lg border">
        <TabLink to="overview" label="Overview" />
        <TabLink to="builder" label="Builder" />
        <TabLink to="distribute" label="Distribute" />
        <TabLink to="responses" label="Responses" />
        <TabLink to="analytics" label="Analytics" />
        <TabLink to="actions" label="Actions" />
        <TabLink to="settings" label="Settings" />
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <Suspense fallback={<div className="p-4"><LoadingSpinner /></div>}>
          <Routes>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<FeedbackOverview />} />
            <Route path="builder/*" element={<FeedbackBuilder />} />
            <Route path="distribute" element={<FeedbackDistribute />} />
            <Route path="responses" element={<FeedbackResponses />} />
            <Route path="analytics" element={<FeedbackAnalytics />} />
            <Route path="actions" element={<FeedbackActions />} />
            <Route path="settings" element={<FeedbackSettings />} />
            <Route path="*" element={<Navigate to="overview" replace />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
};

export default FeedbackManagement;



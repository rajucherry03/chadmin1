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
      `px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
        isActive 
          ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 border-orange-600" 
          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-500"
      }`
    }
  >
    {label}
  </NavLink>
);

const FeedbackManagement = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
              <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Feedback Management</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Create, distribute, and analyze feedback forms to gather valuable insights from students, faculty, and staff.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex gap-3 flex-wrap justify-center">
              <TabLink to="overview" label="Overview" />
              <TabLink to="builder" label="Form Builder" />
              <TabLink to="distribute" label="Distribute" />
              <TabLink to="responses" label="Responses" />
              <TabLink to="analytics" label="Analytics" />
              <TabLink to="actions" label="Actions" />
              <TabLink to="settings" label="Settings" />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <Suspense fallback={
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <LoadingSpinner />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading feedback management tools...</p>
                  </div>
                </div>
              }>
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
        </div>
      </div>
    </div>
  );
};

export default FeedbackManagement;



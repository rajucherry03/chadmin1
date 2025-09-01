import React, { useEffect, useState } from "react";
import { listFeedbackForms, createFeedbackForm } from "../../utils/feedbackService";
import { Link } from "react-router-dom";

const Stat = ({ label, value, icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center">
      <div className={`flex-shrink-0 w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
      <div className="ml-4">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</div>
      </div>
    </div>
  </div>
);

const FeedbackOverview = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await listFeedbackForms();
      if (mounted) {
        setForms(data);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const id = await createFeedbackForm({ title: "Untitled Feedback Form", status: "draft" });
      // Reload list
      const data = await listFeedbackForms();
      setForms(data);
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'draft':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      case 'closed':
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Feedback Forms Overview</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage and monitor your feedback collection forms</p>
        </div>
        <button 
          onClick={handleCreate} 
          disabled={creating} 
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {creating ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </div>
          ) : (
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Form
            </div>
          )}
        </button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat 
          label="Active Forms" 
          value={forms.filter(f => f.status === "published").length}
          icon={
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="bg-green-100 dark:bg-green-900/30"
        />
        <Stat 
          label="Draft Forms" 
          value={forms.filter(f => f.status === "draft").length}
          icon={
            <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
          color="bg-yellow-100 dark:bg-yellow-900/30"
        />
        <Stat 
          label="Closed Forms" 
          value={forms.filter(f => f.status === "closed").length}
          icon={
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          }
          color="bg-gray-100 dark:bg-gray-900/30"
        />
        <Stat 
          label="Total Forms" 
          value={forms.length}
          icon={
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          color="bg-blue-100 dark:bg-blue-900/30"
        />
      </div>

      {/* Recent Forms Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Feedback Forms</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage and edit your feedback collection forms</p>
      </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Loading feedback forms...</p>
          </div>
        ) : forms.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No feedback forms yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by creating your first feedback form to collect valuable insights.</p>
            <button 
              onClick={handleCreate}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200"
            >
              Create Your First Form
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Form Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {forms.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{f.title || "Untitled Form"}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">ID: {f.id}</div>
                </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(f.status)}`}>
                        {f.status || "draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link 
                        to={`/feedback-management/builder?formId=${f.id}`} 
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 dark:text-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Form
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
                </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackOverview;



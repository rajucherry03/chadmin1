import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getFeedbackForm, updateFeedbackForm } from "../../utils/feedbackService";

const QUESTION_TYPES = [
  { value: "single-choice", label: "Single Choice", icon: "🔘" },
  { value: "multi-choice", label: "Multiple Choice", icon: "☑️" },
  { value: "rating", label: "Rating", icon: "⭐" },
  { value: "nps", label: "NPS", icon: "📊" },
  { value: "likert", label: "Likert", icon: "📈" },
  { value: "text", label: "Open Text", icon: "📝" },
  { value: "file-upload", label: "File Upload", icon: "📎" },
  { value: "matrix", label: "Matrix", icon: "🔲" },
];

const FeedbackBuilder = () => {
  const [searchParams] = useSearchParams();
  const formId = useMemo(() => searchParams.get("formId"), [searchParams]);
  const [formMeta, setFormMeta] = useState({ title: "", description: "", status: "draft" });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!formId) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await getFeedbackForm(formId);
      if (mounted && data) {
        setFormMeta({
          title: data.title || "",
          description: data.description || "",
          status: data.status || "draft",
        });
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [formId]);

  const addQuestion = () => {
    setQuestions(prev => ([
      ...prev,
      { id: Date.now().toString(), type: "text", text: "", required: false, options: [] }
    ]));
  };

  const saveMeta = async () => {
    if (!formId) return;
    setSaving(true);
    try {
      await updateFeedbackForm(formId, {
        title: formMeta.title,
        description: formMeta.description,
      });
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (!formId) return;
    setSaving(true);
    try {
      await updateFeedbackForm(formId, { status: "published" });
      setFormMeta(prev => ({ ...prev, status: "published" }));
    } finally {
      setSaving(false);
    }
  };

  if (!formId) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
          <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Form Selected</h3>
        <p className="text-gray-600 dark:text-gray-400">Please create or select a form from the Overview tab to start building.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
          <svg className="w-6 h-6 text-orange-600 dark:text-orange-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Loading form data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Form Builder</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Form ID: {formId}</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={saveMeta} 
              disabled={!formId || saving} 
              className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save
                </div>
              )}
            </button>
            <button 
              onClick={publish} 
              disabled={!formId || formMeta.status === "published" || saving} 
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105"
            >
              {formMeta.status === "published" ? "Published" : "Publish Form"}
            </button>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Form Title <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              value={formMeta.title}
              onChange={e => setFormMeta({ ...formMeta, title: e.target.value })}
              placeholder="e.g., Course Evaluation - Semester 1"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              value={formMeta.description}
              onChange={e => setFormMeta({ ...formMeta, description: e.target.value })}
              placeholder="Purpose, scope, and notes"
            />
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Form Questions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Build your feedback form by adding questions</p>
          </div>
          <button 
            onClick={addQuestion} 
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Question
            </div>
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No questions yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Start building your feedback form by adding your first question.</p>
            <button 
              onClick={addQuestion}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
            >
              Add Your First Question
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Question {idx + 1} <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                      value={q.text}
                      onChange={e => setQuestions(prev => prev.map((x) => x.id === q.id ? { ...x, text: e.target.value } : x))}
                      placeholder={`Enter question ${idx + 1} text`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Question Type
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200"
                      value={q.type}
                      onChange={e => setQuestions(prev => prev.map((x) => x.id === q.id ? { ...x, type: e.target.value } : x))}
                    >
                      {QUESTION_TYPES.map(t => (
                        <option key={t.value} value={t.value}>
                          {t.icon} {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackBuilder;



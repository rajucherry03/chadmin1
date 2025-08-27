import React, { useEffect, useState } from "react";
import { listFeedbackForms, createFeedbackForm } from "../../utils/feedbackService";
import { Link } from "react-router-dom";

const Stat = ({ label, value }) => (
  <div className="p-4 bg-gray-50 rounded-lg border">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-2xl font-semibold text-gray-800 mt-1">{value}</div>
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-gray-700">Manage your feedback forms</div>
        <button onClick={handleCreate} disabled={creating} className="px-3 py-2 bg-orange-500 text-white rounded">
          {creating ? "Creating..." : "Create Form"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Active Forms" value={forms.filter(f => f.status === "published").length} />
        <Stat label="Drafts" value={forms.filter(f => f.status === "draft").length} />
        <Stat label="Closed" value={forms.filter(f => f.status === "closed").length} />
        <Stat label="Total" value={forms.length} />
      </div>

      <div className="p-0 bg-white rounded-lg border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 text-sm text-gray-600">Recent Forms</div>
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Loading...</div>
        ) : forms.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No forms yet. Create your first form.</div>
        ) : (
          <ul className="divide-y">
            {forms.map(f => (
              <li key={f.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <div className="font-medium text-gray-800">{f.title || "Untitled"}</div>
                  <div className="text-xs text-gray-500 capitalize">{f.status || "draft"}</div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/feedback-management/builder?formId=${f.id}`} className="px-2 py-1 text-sm border rounded">Edit</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FeedbackOverview;



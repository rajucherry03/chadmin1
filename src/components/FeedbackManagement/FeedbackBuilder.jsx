import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getFeedbackForm, updateFeedbackForm } from "../../utils/feedbackService";

const QUESTION_TYPES = [
  { value: "single-choice", label: "Single Choice" },
  { value: "multi-choice", label: "Multiple Choice" },
  { value: "rating", label: "Rating" },
  { value: "nps", label: "NPS" },
  { value: "likert", label: "Likert" },
  { value: "text", label: "Open Text" },
  { value: "file-upload", label: "File Upload" },
  { value: "matrix", label: "Matrix" },
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">{formId ? `Form ID: ${formId}` : "Create or select a form from Overview"}</div>
        <div className="flex gap-2">
          <button onClick={saveMeta} disabled={!formId || saving} className="px-3 py-2 border rounded">
            {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={publish} disabled={!formId || formMeta.status === "published" || saving} className="px-3 py-2 bg-orange-500 text-white rounded">
            Publish
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="block text-sm text-gray-600">Form Title</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            value={formMeta.title}
            onChange={e => setFormMeta({ ...formMeta, title: e.target.value })}
            placeholder="e.g., Course Evaluation - Semester 1"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Description</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            value={formMeta.description}
            onChange={e => setFormMeta({ ...formMeta, description: e.target.value })}
            placeholder="Purpose, scope, and notes"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Questions</h3>
        <button onClick={addQuestion} className="px-3 py-2 bg-orange-500 text-white rounded">Add Question</button>
      </div>

      <div className="space-y-3">
        {questions.length === 0 && (
          <div className="text-sm text-gray-500">No questions yet. Click "Add Question" to start.</div>
        )}

        {questions.map((q, idx) => (
          <div key={q.id} className="p-3 border rounded bg-gray-50">
            <div className="grid gap-2 md:grid-cols-4">
              <div className="md:col-span-3">
                <input
                  className="w-full border rounded px-3 py-2"
                  value={q.text}
                  onChange={e => setQuestions(prev => prev.map((x) => x.id === q.id ? { ...x, text: e.target.value } : x))}
                  placeholder={`Q${idx + 1} text`}
                />
              </div>
              <div>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={q.type}
                  onChange={e => setQuestions(prev => prev.map((x) => x.id === q.id ? { ...x, type: e.target.value } : x))}
                >
                  {QUESTION_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackBuilder;



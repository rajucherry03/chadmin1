import { collection, doc, addDoc, getDoc, getDocs, query, where, serverTimestamp, updateDoc, orderBy } from "firebase/firestore";
import { db } from "../firebase";

// Collections
const col = {
  forms: () => collection(db, "feedback_forms"),
  questions: (formId) => collection(db, `feedback_forms/${formId}/questions`),
  responses: (formId) => collection(db, `feedback_forms/${formId}/responses`),
  analytics: (formId) => collection(db, `feedback_forms/${formId}/analytics_snapshots`),
};

export async function createFeedbackForm(meta) {
  const payload = {
    title: meta.title || "Untitled Form",
    description: meta.description || "",
    created_by: meta.created_by || null,
    created_at: serverTimestamp(),
    start_date: meta.start_date || null,
    end_date: meta.end_date || null,
    visibility: meta.visibility || "internal",
    status: meta.status || "draft",
    anonymous_allowed: !!meta.anonymous_allowed,
    response_limit: meta.response_limit ?? null,
  };
  const ref = await addDoc(col.forms(), payload);
  return ref.id;
}

export async function listFeedbackForms(status) {
  const base = status ? query(col.forms(), where("status", "==", status)) : col.forms();
  const q = query(base, orderBy("created_at", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getFeedbackForm(formId) {
  const snap = await getDoc(doc(db, "feedback_forms", formId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function addQuestion(formId, question) {
  const payload = {
    seq_no: question.seq_no ?? 0,
    type: question.type,
    required: !!question.required,
    text: question.text || "",
    options: question.options || [],
  };
  const ref = await addDoc(col.questions(formId), payload);
  return ref.id;
}

export async function updateFormStatus(formId, status) {
  await updateDoc(doc(db, "feedback_forms", formId), { status });
}

export async function updateFeedbackForm(formId, updates) {
  await updateDoc(doc(db, "feedback_forms", formId), {
    ...updates,
  });
}




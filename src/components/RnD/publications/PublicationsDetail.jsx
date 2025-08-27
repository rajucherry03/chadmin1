import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "../../../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

const COLLECTION = "rnd_publication_details";

const empty = {
  serialNo: "",
  authors: "", // Name of the authors (as per publication)
  mitsAlone: { A1: "", A2: "", A3: "", A4: "" }, // A1..A4 (dept)
  otherAuthorPositionNumber: "",
  journalName: "",
  articleType: "Journal Article/Conference publication",
  indexedIn: "", // Scopus/SCI/SCIE/SSCI
  isPaid: "", // Paid/Unpaid
  title: "",
  doiOrUrl: "",
  monthYear: "", // Month & year (electronic)
  impactFactorOrCiteScore: "",
  hIndexOfJournal: "",
  journalQuartile: "", // Q1/Q2/Q3/Q4
};

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm text-gray-600">{label}</label>
    {children}
  </div>
);

const PublicationsDetail = () => {
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const { data = [], isLoading } = useQuery({
    queryKey: [COLLECTION],
    queryFn: async () => {
      const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });

  const addMutation = useMutation({
    mutationFn: async (payload) => {
      const ref = await addDoc(collection(db, COLLECTION), {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return ref.id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [COLLECTION] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => updateDoc(doc(db, COLLECTION, id), { ...payload, updatedAt: serverTimestamp() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [COLLECTION] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => deleteDoc(doc(db, COLLECTION, id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [COLLECTION] }),
  });

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      serialNo: form.serialNo?.toString().trim(),
      authors: form.authors?.trim(),
      journalName: form.journalName?.trim(),
      articleType: form.articleType?.trim(),
      indexedIn: form.indexedIn?.trim(),
      isPaid: form.isPaid?.trim(),
      title: form.title?.trim(),
      doiOrUrl: form.doiOrUrl?.trim(),
      monthYear: form.monthYear?.trim(),
      impactFactorOrCiteScore: form.impactFactorOrCiteScore?.toString().trim(),
      hIndexOfJournal: form.hIndexOfJournal?.toString().trim(),
      journalQuartile: form.journalQuartile?.trim(),
    };
    if (!payload.authors || !payload.title) return;
    if (editingId) await updateMutation.mutateAsync({ id: editingId, payload });
    else await addMutation.mutateAsync(payload);
    setEditingId(null);
    setForm(empty);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Publication Details</h2>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="S.No">
          <input className="border rounded p-2" value={form.serialNo} onChange={(e) => setForm({ ...form, serialNo: e.target.value })} />
        </Field>
        <Field label="Name of the authors (as per publication)">
          <input className="border rounded p-2" value={form.authors} onChange={(e) => setForm({ ...form, authors: e.target.value })} required />
        </Field>

        <div className="md:col-span-2 border rounded p-3">
          <div className="font-medium mb-2">MITS Alone (A1..A4 dept)</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(["A1","A2","A3","A4"]).map((k) => (
              <Field key={k} label={`${k}(dept)`}>
                <input className="border rounded p-2" value={form.mitsAlone[k]} onChange={(e) => setForm({ ...form, mitsAlone: { ...form.mitsAlone, [k]: e.target.value } })} />
              </Field>
            ))}
          </div>
        </div>

        <Field label="Other Author position number">
          <input className="border rounded p-2" value={form.otherAuthorPositionNumber} onChange={(e) => setForm({ ...form, otherAuthorPositionNumber: e.target.value })} />
        </Field>
        <Field label="Journal name">
          <input className="border rounded p-2" value={form.journalName} onChange={(e) => setForm({ ...form, journalName: e.target.value })} />
        </Field>
        <Field label="Journal Article/Conference publication">
          <select className="border rounded p-2" value={form.articleType} onChange={(e) => setForm({ ...form, articleType: e.target.value })}>
            <option>Journal Article</option>
            <option>Conference publication</option>
          </select>
        </Field>
        <Field label="Indexed (Scopus/SCI/SCIE/SSCI)">
          <input className="border rounded p-2" value={form.indexedIn} onChange={(e) => setForm({ ...form, indexedIn: e.target.value })} placeholder="e.g., Scopus" />
        </Field>
        <Field label="Paid/Unpaid">
          <select className="border rounded p-2" value={form.isPaid} onChange={(e) => setForm({ ...form, isPaid: e.target.value })}>
            <option>Paid</option>
            <option>Unpaid</option>
          </select>
        </Field>
        <Field label="Title of the paper">
          <input className="border rounded p-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </Field>
        <Field label="DOI / URL">
          <input className="border rounded p-2" value={form.doiOrUrl} onChange={(e) => setForm({ ...form, doiOrUrl: e.target.value })} />
        </Field>
        <Field label="Month & year (electronic)">
          <input className="border rounded p-2" value={form.monthYear} onChange={(e) => setForm({ ...form, monthYear: e.target.value })} placeholder="e.g., Nov 2024" />
        </Field>
        <Field label="Impact factor of the Journal / cite score">
          <input className="border rounded p-2" value={form.impactFactorOrCiteScore} onChange={(e) => setForm({ ...form, impactFactorOrCiteScore: e.target.value })} />
        </Field>
        <Field label="H index of the journal">
          <input className="border rounded p-2" value={form.hIndexOfJournal} onChange={(e) => setForm({ ...form, hIndexOfJournal: e.target.value })} />
        </Field>
        <Field label="Journal Quartile (Q1/Q2/Q3/Q4)">
          <select className="border rounded p-2" value={form.journalQuartile} onChange={(e) => setForm({ ...form, journalQuartile: e.target.value })}>
            {(["Q1","Q2","Q3","Q4"]).map(q => <option key={q}>{q}</option>)}
          </select>
        </Field>

        <div className="md:col-span-2 flex gap-2">
          <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded">{editingId ? "Update" : "Save"} Publication</button>
          {editingId && <button type="button" className="border px-4 py-2 rounded" onClick={() => { setEditingId(null); setForm(empty); }}>Cancel</button>}
        </div>
      </form>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">S.No</th>
                <th className="p-2">Authors</th>
                <th className="p-2">Title</th>
                <th className="p-2">Journal</th>
                <th className="p-2">Indexed</th>
                <th className="p-2">Quartile</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{r.serialNo}</td>
                  <td className="p-2">{r.authors}</td>
                  <td className="p-2">{r.title}</td>
                  <td className="p-2">{r.journalName}</td>
                  <td className="p-2">{r.indexedIn}</td>
                  <td className="p-2">{r.journalQuartile}</td>
                  <td className="p-2 flex gap-2">
                    <button className="text-blue-600" onClick={() => { setEditingId(r.id); setForm({ ...empty, ...r }); }}>Edit</button>
                    <button className="text-red-600" onClick={async () => { if (window.confirm('Delete this record?')) { const { deleteDoc, doc } = await import('firebase/firestore'); await deleteDoc(doc(db, COLLECTION, r.id)); qc.invalidateQueries({ queryKey: [COLLECTION] }); } }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PublicationsDetail;



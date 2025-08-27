import React, { useMemo, useState } from "react";
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

const COLLECTION = "rnd_faculty_outputs";

const academicYears = ["2024-25","2023-24","2022-23","2021-22"];

const empty = {
  serialNo: "",
  facultyName: "",
  dateOfJoin: "",
  totalExperienceInMITS: "",
  journalPublicationsWithMITS: { total: 0, firstAuthor: 0, otherThanFirstAuthor: 0 },
  conferencePublicationsWithMITS: { total: 0, firstAuthor: 0, otherThanFirstAuthor: 0 },
  journalFirstAuthorPublications: Object.fromEntries(academicYears.map(y => [y, 0])),
  journalOtherFirstAuthorPublications: Object.fromEntries(academicYears.map(y => [y, 0])),
  conferenceFirstAuthorPublications: Object.fromEntries(academicYears.map(y => [y, 0])),
  conferenceOtherFirstAuthorPublications: Object.fromEntries(academicYears.map(y => [y, 0])),
  booksOrChapters: Object.fromEntries(academicYears.map(y => [y, 0])),
  patents: Object.fromEntries(academicYears.map(y => [y, 0])),
  notes: "",
};

const toNumber = (v) => (v === "" || v === null || v === undefined ? 0 : Number(v));

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm text-gray-600">{label}</label>
    {children}
  </div>
);

const YearGrid = ({ title, value, onChange }) => (
  <div className="border rounded p-3">
    <div className="font-medium mb-2">{title}</div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {academicYears.map((y) => (
        <div key={y} className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">AY: {y}</span>
          <input
            type="number"
            className="border rounded p-2"
            value={value[y]}
            min="0"
            onChange={(e) => onChange({ ...value, [y]: toNumber(e.target.value) })}
          />
        </div>
      ))}
    </div>
  </div>
);

const FacultyOutputs = () => {
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
    mutationFn: async ({ id, payload }) => {
      await updateDoc(doc(db, COLLECTION, id), { ...payload, updatedAt: serverTimestamp() });
    },
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
      facultyName: form.facultyName?.trim(),
      totalExperienceInMITS: form.totalExperienceInMITS?.toString().trim(),
    };
    if (!payload.facultyName) return;
    if (editingId) await updateMutation.mutateAsync({ id: editingId, payload });
    else await addMutation.mutateAsync(payload);
    setEditingId(null);
    setForm(empty);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Faculty Outputs (Year-wise)</h2>

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="S.No.">
          <input className="border rounded p-2" value={form.serialNo} onChange={(e) => setForm({ ...form, serialNo: e.target.value })} />
        </Field>
        <Field label="Name of the Faculty">
          <input className="border rounded p-2" value={form.facultyName} onChange={(e) => setForm({ ...form, facultyName: e.target.value })} required />
        </Field>
        <Field label="Date of Join in MITS">
          <input type="date" className="border rounded p-2" value={form.dateOfJoin} onChange={(e) => setForm({ ...form, dateOfJoin: e.target.value })} />
        </Field>
        <Field label="Total Experience in MITS">
          <input className="border rounded p-2" value={form.totalExperienceInMITS} onChange={(e) => setForm({ ...form, totalExperienceInMITS: e.target.value })} />
        </Field>

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded p-3">
            <div className="font-medium mb-2">Journal Publications with MITS</div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Total">
                <input type="number" className="border rounded p-2" value={form.journalPublicationsWithMITS.total} min="0" onChange={(e) => setForm({ ...form, journalPublicationsWithMITS: { ...form.journalPublicationsWithMITS, total: toNumber(e.target.value) } })} />
              </Field>
              <Field label="As first Author">
                <input type="number" className="border rounded p-2" value={form.journalPublicationsWithMITS.firstAuthor} min="0" onChange={(e) => setForm({ ...form, journalPublicationsWithMITS: { ...form.journalPublicationsWithMITS, firstAuthor: toNumber(e.target.value) } })} />
              </Field>
              <Field label="Other than first Author">
                <input type="number" className="border rounded p-2" value={form.journalPublicationsWithMITS.otherThanFirstAuthor} min="0" onChange={(e) => setForm({ ...form, journalPublicationsWithMITS: { ...form.journalPublicationsWithMITS, otherThanFirstAuthor: toNumber(e.target.value) } })} />
              </Field>
            </div>
          </div>
          <div className="border rounded p-3">
            <div className="font-medium mb-2">Conference Publications with MITS</div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Total">
                <input type="number" className="border rounded p-2" value={form.conferencePublicationsWithMITS.total} min="0" onChange={(e) => setForm({ ...form, conferencePublicationsWithMITS: { ...form.conferencePublicationsWithMITS, total: toNumber(e.target.value) } })} />
              </Field>
              <Field label="As first Author">
                <input type="number" className="border rounded p-2" value={form.conferencePublicationsWithMITS.firstAuthor} min="0" onChange={(e) => setForm({ ...form, conferencePublicationsWithMITS: { ...form.conferencePublicationsWithMITS, firstAuthor: toNumber(e.target.value) } })} />
              </Field>
              <Field label="Other than first Author">
                <input type="number" className="border rounded p-2" value={form.conferencePublicationsWithMITS.otherThanFirstAuthor} min="0" onChange={(e) => setForm({ ...form, conferencePublicationsWithMITS: { ...form.conferencePublicationsWithMITS, otherThanFirstAuthor: toNumber(e.target.value) } })} />
              </Field>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 gap-4">
          <YearGrid title="Journal First Author Publications" value={form.journalFirstAuthorPublications} onChange={(v) => setForm({ ...form, journalFirstAuthorPublications: v })} />
          <YearGrid title="Journal Other than First Author Publications" value={form.journalOtherFirstAuthorPublications} onChange={(v) => setForm({ ...form, journalOtherFirstAuthorPublications: v })} />
          <YearGrid title="Conference First Author Publications" value={form.conferenceFirstAuthorPublications} onChange={(v) => setForm({ ...form, conferenceFirstAuthorPublications: v })} />
          <YearGrid title="Conference other than First Author Publications" value={form.conferenceOtherFirstAuthorPublications} onChange={(v) => setForm({ ...form, conferenceOtherFirstAuthorPublications: v })} />
          <YearGrid title="Book / Book Chapters" value={form.booksOrChapters} onChange={(v) => setForm({ ...form, booksOrChapters: v })} />
          <YearGrid title="Patents" value={form.patents} onChange={(v) => setForm({ ...form, patents: v })} />
        </div>

        <Field label="Notes">
          <textarea className="border rounded p-2" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Field>

        <div className="md:col-span-2 flex gap-2">
          <button className="bg-orange-500 text-white px-4 py-2 rounded" type="submit">{editingId ? "Update" : "Save"} Record</button>
          {editingId && <button className="border px-4 py-2 rounded" type="button" onClick={() => { setEditingId(null); setForm(empty); }}>Cancel</button>}
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
                <th className="p-2">Faculty</th>
                <th className="p-2">Join Date</th>
                <th className="p-2">Journal(MITS)</th>
                <th className="p-2">Conference(MITS)</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{r.serialNo}</td>
                  <td className="p-2">{r.facultyName}</td>
                  <td className="p-2">{r.dateOfJoin || '-'}</td>
                  <td className="p-2">{r.journalPublicationsWithMITS?.total ?? 0}</td>
                  <td className="p-2">{r.conferencePublicationsWithMITS?.total ?? 0}</td>
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

export default FacultyOutputs;



import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "../../../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";

const COLLECTION = "rnd_projects";

const emptyProject = {
  title: "",
  principalInvestigator: "",
  coInvestigators: [],
  teamMembers: [],
  startDate: "",
  endDate: "",
  milestones: [],
  deliverables: [],
  budgetAllocated: 0,
  budgetUtilized: 0,
  status: "Draft", // Draft, Submitted, Approved, Ongoing, Completed
  summary: "",
};

const toNumber = (v) => (v === "" || v === null || v === undefined ? 0 : Number(v));

const useProjects = () => {
  return useQuery({
    queryKey: [COLLECTION],
    queryFn: async () => {
      const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });
};

const Projects = () => {
  const qc = useQueryClient();
  const { data = [], isLoading } = useProjects();
  const [form, setForm] = useState(emptyProject);
  const [editingId, setEditingId] = useState(null);

  const addMutation = useMutation({
    mutationFn: async (payload) => {
      const ref = await addDoc(collection(db, COLLECTION), {
        ...payload,
        budgetAllocated: toNumber(payload.budgetAllocated),
        budgetUtilized: toNumber(payload.budgetUtilized),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return ref.id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [COLLECTION] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      await updateDoc(doc(db, COLLECTION, id), {
        ...payload,
        budgetAllocated: toNumber(payload.budgetAllocated),
        budgetUtilized: toNumber(payload.budgetUtilized),
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [COLLECTION] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await deleteDoc(doc(db, COLLECTION, id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [COLLECTION] }),
  });

  const startEdit = (project) => {
    setEditingId(project.id);
    setForm({ ...project });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyProject);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      principalInvestigator: form.principalInvestigator.trim(),
      coInvestigators: (form.coInvestigators || []).map((s) => s.trim()).filter(Boolean),
      teamMembers: (form.teamMembers || []).map((s) => s.trim()).filter(Boolean),
      startDate: form.startDate || "",
      endDate: form.endDate || "",
      milestones: (form.milestones || []).map((s) => s.trim()).filter(Boolean),
      deliverables: (form.deliverables || []).map((s) => s.trim()).filter(Boolean),
      budgetAllocated: toNumber(form.budgetAllocated),
      budgetUtilized: toNumber(form.budgetUtilized),
      status: form.status || "Draft",
      summary: form.summary || "",
    };

    if (!payload.title) return;

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, payload });
    } else {
      await addMutation.mutateAsync(payload);
    }
    cancelEdit();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    await deleteMutation.mutateAsync(id);
  };

  const onCsvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = text.split(/\r?\n/).filter(Boolean);
    const [header, ...dataRows] = rows;
    const cols = header.split(",");
    for (const row of dataRows) {
      const values = row.split(",");
      const obj = Object.fromEntries(cols.map((c, i) => [c.trim(), values[i] ? values[i].trim() : ""]))
      await addMutation.mutateAsync({
        title: obj.title || obj.projectTitle || "",
        principalInvestigator: obj.principalInvestigator || obj.pi || "",
        coInvestigators: (obj.coInvestigators || "").split(";").filter(Boolean),
        teamMembers: (obj.teamMembers || "").split(";").filter(Boolean),
        startDate: obj.startDate || "",
        endDate: obj.endDate || "",
        milestones: (obj.milestones || "").split(";").filter(Boolean),
        deliverables: (obj.deliverables || "").split(";").filter(Boolean),
        budgetAllocated: toNumber(obj.budgetAllocated || obj.budget),
        budgetUtilized: toNumber(obj.budgetUtilized || 0),
        status: obj.status || "Submitted",
        summary: obj.summary || "",
      });
    }
  };

  const Field = ({ label, children }) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-600">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Research Projects</h2>
        <input type="file" accept=".csv" onChange={onCsvUpload} className="text-sm" />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Project Title">
          <input
            className="border rounded p-2"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </Field>
        <Field label="Principal Investigator">
          <input
            className="border rounded p-2"
            value={form.principalInvestigator}
            onChange={(e) => setForm({ ...form, principalInvestigator: e.target.value })}
            required
          />
        </Field>
        <Field label="Co-PIs (semicolon-separated)">
          <input
            className="border rounded p-2"
            value={(form.coInvestigators || []).join(";")}
            onChange={(e) => setForm({ ...form, coInvestigators: e.target.value.split(";") })}
          />
        </Field>
        <Field label="Team Members (semicolon-separated)">
          <input
            className="border rounded p-2"
            value={(form.teamMembers || []).join(";")}
            onChange={(e) => setForm({ ...form, teamMembers: e.target.value.split(";") })}
          />
        </Field>
        <Field label="Start Date">
          <input
            type="date"
            className="border rounded p-2"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
        </Field>
        <Field label="End Date">
          <input
            type="date"
            className="border rounded p-2"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
        </Field>
        <Field label="Milestones (semicolon-separated)">
          <input
            className="border rounded p-2"
            value={(form.milestones || []).join(";")}
            onChange={(e) => setForm({ ...form, milestones: e.target.value.split(";") })}
          />
        </Field>
        <Field label="Deliverables (semicolon-separated)">
          <input
            className="border rounded p-2"
            value={(form.deliverables || []).join(";")}
            onChange={(e) => setForm({ ...form, deliverables: e.target.value.split(";") })}
          />
        </Field>
        <Field label="Budget Allocated">
          <input
            type="number"
            className="border rounded p-2"
            value={form.budgetAllocated}
            onChange={(e) => setForm({ ...form, budgetAllocated: e.target.value })}
            min="0"
          />
        </Field>
        <Field label="Budget Utilized">
          <input
            type="number"
            className="border rounded p-2"
            value={form.budgetUtilized}
            onChange={(e) => setForm({ ...form, budgetUtilized: e.target.value })}
            min="0"
          />
        </Field>
        <Field label="Status">
          <select
            className="border rounded p-2"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {["Draft","Submitted","Approved","Ongoing","Completed"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Summary">
          <textarea
            className="border rounded p-2 md:col-span-2"
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            rows={3}
          />
        </Field>
        <div className="md:col-span-2 flex gap-2">
          <button className="bg-orange-500 text-white px-4 py-2 rounded" type="submit">
            {editingId ? "Update" : "Create"} Project
          </button>
          {editingId && (
            <button className="border px-4 py-2 rounded" type="button" onClick={cancelEdit}>Cancel</button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Title</th>
                <th className="p-2">PI</th>
                <th className="p-2">Dates</th>
                <th className="p-2">Budget</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{p.title}</td>
                  <td className="p-2">{p.principalInvestigator}</td>
                  <td className="p-2">{p.startDate || "-"} → {p.endDate || "-"}</td>
                  <td className="p-2">{toNumber(p.budgetUtilized)} / {toNumber(p.budgetAllocated)}</td>
                  <td className="p-2">{p.status}</td>
                  <td className="p-2 flex gap-2">
                    <button className="text-blue-600" onClick={() => startEdit(p)}>Edit</button>
                    <button className="text-red-600" onClick={() => handleDelete(p.id)}>Delete</button>
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

export default Projects;



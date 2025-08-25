import React, { useState } from "react";
import { useCollection, addItem, updateItem, runBatch } from "../../utils/firestoreHooks";

const SecurityVisitors = () => {
  const { data: visitors } = useCollection("hm_visitors", { orderByField: "in_time", orderDirection: "desc" });
  const { data: incidents } = useCollection("hm_incidents", { orderByField: "timestamp", orderDirection: "desc" });
  const [entry, setEntry] = useState({ visitor_name: "", purpose: "", in_time: new Date().toISOString(), id_proof: "", host_student_id: "" });
  const [incident, setIncident] = useState({ title: "", description: "", severity: "low", timestamp: new Date().toISOString() });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-3">Visitor Gate Log</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <input className="input" placeholder="Name" value={entry.visitor_name} onChange={e=>setEntry(v=>({...v,visitor_name:e.target.value}))} />
          <input className="input" placeholder="Purpose" value={entry.purpose} onChange={e=>setEntry(v=>({...v,purpose:e.target.value}))} />
          <input className="input" placeholder="Host Student ID" value={entry.host_student_id} onChange={e=>setEntry(v=>({...v,host_student_id:e.target.value}))} />
          <input className="input" placeholder="ID Proof" value={entry.id_proof} onChange={e=>setEntry(v=>({...v,id_proof:e.target.value}))} />
          <button className="px-3 py-2 bg-orange-600 text-white rounded" onClick={async () => {
            await runBatch([
              { type: 'add', collection: 'hm_visitors', data: { ...entry, out_time: null } },
              { type: 'add', collection: 'hm_audit', data: { entity: 'visitor', entity_id: entry.visitor_name, action: 'checkin', user_id: 'system', timestamp: new Date().toISOString(), notes: entry.host_student_id } }
            ]);
          }}>Check-in</button>
          <button className="px-3 py-2 bg-gray-700 text-white rounded" onClick={async () => {
            const open = visitors.find(v => !v.out_time);
            if (open) await runBatch([
              { type: 'update', collection: 'hm_visitors', id: open.id, data: { out_time: new Date().toISOString() } },
              { type: 'add', collection: 'hm_audit', data: { entity: 'visitor', entity_id: open.id, action: 'checkout', user_id: 'system', timestamp: new Date().toISOString() } }
            ]);
          }}>Checkout last open</button>
        </div>
        <div className="mt-3 overflow-auto">
          <table className="min-w-full text-sm"><thead className="bg-gray-50"><tr className="text-left text-gray-600"><th className="px-2 py-2">Name</th><th className="px-2 py-2">Purpose</th><th className="px-2 py-2">In</th><th className="px-2 py-2">Out</th><th className="px-2 py-2">Host</th></tr></thead><tbody>
            {visitors.length===0 && (<tr><td colSpan={5} className="text-center text-gray-400 py-6">No visitors logged.</td></tr>)}
            {visitors.slice(-50).reverse().map(v => (<tr key={v.id} className="border-t hover:bg-gray-50"><td className="px-2 py-2">{v.visitor_name}</td><td className="px-2 py-2">{v.purpose}</td><td className="px-2 py-2">{v.in_time}</td><td className="px-2 py-2">{v.out_time||'-'}</td><td className="px-2 py-2">{v.host_student_id}</td></tr>))}
          </tbody></table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-3">Incident Reporting</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input className="input" placeholder="Title" value={incident.title} onChange={e=>setIncident(v=>({...v,title:e.target.value}))} />
          <input className="input" placeholder="Description" value={incident.description} onChange={e=>setIncident(v=>({...v,description:e.target.value}))} />
          <select className="input" value={incident.severity} onChange={e=>setIncident(v=>({...v,severity:e.target.value}))}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button className="px-3 py-2 bg-orange-600 text-white rounded" onClick={async () => await addItem("hm_incidents", incident)}>Log</button>
        </div>
        <div className="mt-3 overflow-auto"><table className="min-w-full text-sm"><thead className="bg-gray-50"><tr className="text-left text-gray-600"><th className="px-2 py-2">Time</th><th className="px-2 py-2">Title</th><th className="px-2 py-2">Severity</th></tr></thead><tbody>
          {incidents.length===0 && (<tr><td colSpan={3} className="text-center text-gray-400 py-6">No incidents reported.</td></tr>)}
          {incidents.slice(-50).reverse().map(i => (<tr key={i.id} className="border-t hover:bg-gray-50"><td className="px-2 py-2">{i.timestamp}</td><td className="px-2 py-2">{i.title}</td><td className="px-2 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${i.severity==='high'?'bg-red-100 text-red-700':i.severity==='medium'?'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700'}`}>{i.severity}</span></td></tr>))}
        </tbody></table></div>
      </div>
    </div>
  );
};

export default SecurityVisitors;



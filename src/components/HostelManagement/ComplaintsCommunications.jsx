import React, { useState } from "react";
import { useCollection, addItem } from "../../utils/firestoreHooks";

const ComplaintsCommunications = () => {
  const { data: complaints } = useCollection("hm_complaints", { orderByField: "created_at", orderDirection: "desc" });
  const { data: notices } = useCollection("hm_notices", { orderByField: "created_at", orderDirection: "desc" });
  const [c, setC] = useState({ student_id: "", type: "maintenance", description: "", priority: "medium", status: "open", assigned_to: "" });
  const [n, setN] = useState({ title: "", level: "hostel", message: "" });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-3">Complaints / Requests</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <input className="input" placeholder="Student ID" value={c.student_id} onChange={e=>setC(v=>({...v,student_id:e.target.value}))} />
          <select className="input" value={c.type} onChange={e=>setC(v=>({...v,type:e.target.value}))}>
            <option value="maintenance">Maintenance</option>
            <option value="mess">Mess</option>
            <option value="security">Security</option>
            <option value="cleaning">Cleaning</option>
          </select>
          <input className="input" placeholder="Description" value={c.description} onChange={e=>setC(v=>({...v,description:e.target.value}))} />
          <select className="input" value={c.priority} onChange={e=>setC(v=>({...v,priority:e.target.value}))}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button className="px-3 py-2 bg-orange-600 text-white rounded" onClick={async () => await addItem("hm_complaints", { created_at: new Date().toISOString(), ...c })}>Submit</button>
        </div>
        <div className="mt-3 overflow-auto"><table className="min-w-full text-sm"><thead className="bg-gray-50"><tr className="text-left text-gray-600"><th className="px-2 py-2">Time</th><th className="px-2 py-2">Student</th><th className="px-2 py-2">Type</th><th className="px-2 py-2">Priority</th><th className="px-2 py-2">Status</th></tr></thead><tbody>
          {complaints.length===0 && (<tr><td colSpan={5} className="text-center text-gray-400 py-6">No complaints submitted.</td></tr>)}
          {complaints.slice(-50).reverse().map(x => (<tr key={x.id} className="border-t hover:bg-gray-50"><td className="px-2 py-2">{x.created_at}</td><td className="px-2 py-2">{x.student_id}</td><td className="px-2 py-2">{x.type}</td><td className="px-2 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${x.priority==='high'?'bg-red-100 text-red-700':x.priority==='medium'?'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700'}`}>{x.priority}</span></td><td className="px-2 py-2">{x.status}</td></tr>))}
        </tbody></table></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-3">Noticeboard</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input className="input" placeholder="Title" value={n.title} onChange={e=>setN(v=>({...v,title:e.target.value}))} />
          <select className="input" value={n.level} onChange={e=>setN(v=>({...v,level:e.target.value}))}>
            <option value="hostel">Hostel</option>
            <option value="block">Block</option>
            <option value="floor">Floor</option>
          </select>
          <input className="input" placeholder="Message" value={n.message} onChange={e=>setN(v=>({...v,message:e.target.value}))} />
          <button className="px-3 py-2 bg-orange-600 text-white rounded" onClick={async () => await addItem("hm_notices", { created_at: new Date().toISOString(), ...n })}>Publish</button>
        </div>
        <div className="mt-3 overflow-auto"><table className="min-w-full text-sm"><thead className="bg-gray-50"><tr className="text-left text-gray-600"><th className="px-2 py-2">Time</th><th className="px-2 py-2">Title</th><th className="px-2 py-2">Level</th></tr></thead><tbody>
          {notices.length===0 && (<tr><td colSpan={3} className="text-center text-gray-400 py-6">No notices published.</td></tr>)}
          {notices.slice(-50).reverse().map(x => (<tr key={x.id} className="border-t hover:bg-gray-50"><td className="px-2 py-2">{x.created_at}</td><td className="px-2 py-2">{x.title}</td><td className="px-2 py-2 capitalize">{x.level}</td></tr>))}
        </tbody></table></div>
      </div>
    </div>
  );
};

export default ComplaintsCommunications;



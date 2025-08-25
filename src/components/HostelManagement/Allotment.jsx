import React, { useMemo, useState } from "react";
import { useCollection, addItem, updateItem, runBatch } from "../../utils/firestoreHooks";
import { Notice, Spinner } from "./SharedUI.jsx";

const Allotment = () => {
  const { data: hostels } = useCollection("hm_hostels");
  const { data: blocks } = useCollection("hm_blocks");
  const { data: rooms } = useCollection("hm_rooms");
  const { data: beds } = useCollection("hm_beds");
  const { data: wait, loading: loadingWait, error: errorWait } = useCollection("hm_waitlist", { orderByField: "priority_rank" });
  const { data: allots } = useCollection("hm_allotments");

  const [app, setApp] = useState({ student_id: "", roll_no: "", gender: "", preferences: { hostel_id: "", room_type: "" }, priority_rank: 0 });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState({ type: '', message: '' });

  const vacantBeds = useMemo(() => beds.filter(b => b.status === 'vacant'), [beds]);

  const autoAllot = async () => {
    // Sort by explicit priority then by applied_on
    const sorted = [...wait].sort((a,b) => (a.priority_rank||999) - (b.priority_rank||999));
    const ops = [];
    for (const w of sorted) {
      const preferredRooms = rooms.filter(r => (!w.preferences?.room_type || r.room_type === w.preferences.room_type));
      const preferredBeds = beds.filter(b => preferredRooms.some(r => r.id === b.room_id) && b.status === 'vacant');
      if (preferredBeds.length) {
        const seat = preferredBeds[0];
        ops.push({ type: 'add', collection: 'hm_allotments', data: { student_id: w.student_id, bed_id: seat.id, room_id: seat.room_id, status: 'active', allot_date: new Date().toISOString(), allotment_reason: 'auto' } });
        ops.push({ type: 'update', collection: 'hm_beds', id: seat.id, data: { status: 'occupied' } });
        ops.push({ type: 'update', collection: 'hm_waitlist', id: w.id, data: { fulfilled: true } });
        ops.push({ type: 'add', collection: 'hm_audit', data: { entity: 'allotment', entity_id: w.student_id, action: 'auto_allot', user_id: 'system', timestamp: new Date().toISOString(), notes: `Seat ${seat.id}` } });
      }
    }
    if (ops.length) await runBatch(ops);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-3">Applications / Waiting List</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input className="input" placeholder="Student ID" value={app.student_id} onChange={e=>setApp(v=>({...v,student_id:e.target.value}))} />
          <input className="input" placeholder="Roll No" value={app.roll_no} onChange={e=>setApp(v=>({...v,roll_no:e.target.value}))} />
          <select className="input" value={app.preferences.room_type} onChange={e=>setApp(v=>({...v,preferences:{...v.preferences,room_type:e.target.value}}))}>
            <option value="">Any Type</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="triple">Triple</option>
            <option value="quad">Quad</option>
          </select>
          <input className="input" type="number" placeholder="Priority Rank" value={app.priority_rank} onChange={e=>setApp(v=>({...v,priority_rank:Number(e.target.value)}))} />
          <button disabled={busy} className={`px-3 py-2 rounded text-white ${busy? 'bg-orange-300' : 'bg-orange-600 hover:bg-orange-500'}`} onClick={async () => {
            try { setBusy(true);
              await addItem("hm_waitlist", { ...app, applied_on: new Date().toISOString() });
              setApp({ student_id: "", roll_no: "", gender: "", preferences: { hostel_id: "", room_type: "" }, priority_rank: 0 });
              setNotice({ type: 'success', message: 'Application added to waiting list' });
            } catch(e) { setNotice({ type: 'error', message: e.message || 'Failed to add application' }); }
            finally { setBusy(false); }
          }}>{busy? <Spinner /> : 'Add to Waiting'}</button>
        </div>

        <div className="mt-3 overflow-auto">
          <Notice type={notice.type} message={notice.message} onClose={()=>setNotice({type:'',message:''})} />
          {loadingWait && <div className="mt-2 text-sm text-gray-500 flex items-center gap-2"><Spinner /> Loading waiting list…</div>}
          {errorWait && <div className="mt-2 text-sm text-red-600">{String(errorWait)}</div>}
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50"><tr className="text-left text-gray-600"><th className="px-2 py-2">Student</th><th className="px-2 py-2">Roll</th><th className="px-2 py-2">Pref Type</th><th className="px-2 py-2">Priority</th></tr></thead>
            <tbody>
              {wait.length===0 && (<tr><td colSpan={4} className="text-center text-gray-400 py-6">No applications yet.</td></tr>)}
              {wait.map(w => (<tr key={w.id} className="border-t hover:bg-gray-50"><td className="px-2 py-2">{w.student_id}</td><td className="px-2 py-2">{w.roll_no}</td><td className="px-2 py-2">{w.preferences?.room_type || '-'}</td><td className="px-2 py-2">{w.priority_rank}</td></tr>))}
            </tbody>
          </table>
        </div>

        <div className="mt-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={autoAllot}>Run Auto-Allotment</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-3">Active Allotments</h3>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50"><tr className="text-left text-gray-600"><th className="px-2 py-2">Student</th><th className="px-2 py-2">Room</th><th className="px-2 py-2">Bed</th><th className="px-2 py-2">Status</th><th className="px-2 py-2">Actions</th></tr></thead>
            <tbody>
              {allots.map(a => {
                const bed = beds.find(b=>b.id===a.bed_id);
                const room = rooms.find(r=>r.id===bed?.room_id);
                return (
                  <tr key={a.allotment_id} className="border-t hover:bg-gray-50">
                    <td className="px-2 py-2">{a.student_id}</td>
                    <td className="px-2 py-2">{room?.room_no || '-'}</td>
                    <td className="px-2 py-2">{bed?.bed_no || '-'}</td>
                    <td className="px-2 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${a.status==='active'?'bg-green-100 text-green-700':a.status==='vacated'?'bg-gray-100 text-gray-700':'bg-yellow-100 text-yellow-700'}`}>{a.status}</span></td>
                    <td className="px-2 py-2">
                      <button className="px-2 py-1 text-xs bg-red-600 text-white rounded" onClick={async () => {
                        await runBatch([
                          { type: 'update', collection: 'hm_allotments', id: a.id, data: { status: 'vacated', vacate_date: new Date().toISOString() } },
                          { type: 'update', collection: 'hm_beds', id: a.bed_id, data: { status: 'vacant' } },
                          { type: 'add', collection: 'hm_audit', data: { entity: 'allotment', entity_id: a.id, action: 'vacate', user_id: 'system', timestamp: new Date().toISOString(), notes: `Bed ${a.bed_id}` } }
                        ]);
                      }}>Vacate</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Allotment;



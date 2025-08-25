import React, { useState } from "react";
import { useCollection, addItem } from "../../utils/firestoreHooks";

const MaintenanceHousekeeping = () => {
  const { data: tickets } = useCollection("hm_maint_tickets", { orderByField: "raised_date", orderDirection: "desc" });
  const { data: assets } = useCollection("hm_assets");
  const { data: schedules } = useCollection("hm_housekeeping");

  const [newTicket, setNewTicket] = useState({ hostel_id: "", block_id: "", room_id: "", issue_type: "plumbing", raised_by: "", assigned_vendor: "", cost: 0, status: "open" });
  const [newAsset, setNewAsset] = useState({ hostel_id: "", item_type: "bed", qty: 1, purchase_date: "", warranty: "", condition: "good" });
  const [newSchedule, setNewSchedule] = useState({ hostel_id: "", block_id: "", floor: 0, janitor_id: "", schedule: "Daily 7AM", status: "active" });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-3">Maintenance Tickets</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <input className="input" placeholder="Hostel ID" value={newTicket.hostel_id} onChange={e=>setNewTicket(v=>({...v,hostel_id:e.target.value}))} />
          <input className="input" placeholder="Block ID" value={newTicket.block_id} onChange={e=>setNewTicket(v=>({...v,block_id:e.target.value}))} />
          <input className="input" placeholder="Room ID" value={newTicket.room_id} onChange={e=>setNewTicket(v=>({...v,room_id:e.target.value}))} />
          <input className="input" placeholder="Issue Type" value={newTicket.issue_type} onChange={e=>setNewTicket(v=>({...v,issue_type:e.target.value}))} />
          <input className="input" placeholder="Raised By" value={newTicket.raised_by} onChange={e=>setNewTicket(v=>({...v,raised_by:e.target.value}))} />
          <button className="px-3 py-2 bg-orange-600 text-white rounded" onClick={async () => await addItem("hm_maint_tickets", { ...newTicket, raised_date: new Date().toISOString() })}>Create</button>
        </div>
        <div className="mt-3 overflow-auto">
          <table className="min-w-full text-sm"><thead className="bg-gray-50"><tr className="text-left text-gray-600"><th className="px-2 py-2">ID</th><th className="px-2 py-2">Issue</th><th className="px-2 py-2">Vendor</th><th className="px-2 py-2">Cost</th><th className="px-2 py-2">Status</th></tr></thead><tbody>
            {tickets.length===0 && (<tr><td colSpan={5} className="text-center text-gray-400 py-6">No tickets yet.</td></tr>)}
            {tickets.map(t => (
              <tr key={t.ticket_id} className="border-t hover:bg-gray-50"><td className="px-2 py-2">{t.ticket_id.slice(0,8)}</td><td className="px-2 py-2">{t.issue_type}</td><td className="px-2 py-2">{t.assigned_vendor||'-'}</td><td className="px-2 py-2">{t.cost}</td><td className="px-2 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${t.status==='open'?'bg-yellow-100 text-yellow-700':t.status==='closed'?'bg-green-100 text-green-700':'bg-blue-100 text-blue-700'}`}>{t.status}</span></td></tr>
            ))}
          </tbody></table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-3">Inventory / Assets</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input className="input" placeholder="Hostel ID" value={newAsset.hostel_id} onChange={e=>setNewAsset(v=>({...v,hostel_id:e.target.value}))} />
          <input className="input" placeholder="Item Type" value={newAsset.item_type} onChange={e=>setNewAsset(v=>({...v,item_type:e.target.value}))} />
          <input className="input" type="number" placeholder="Qty" value={newAsset.qty} onChange={e=>setNewAsset(v=>({...v,qty:Number(e.target.value)}))} />
          <input className="input" type="date" placeholder="Purchase" value={newAsset.purchase_date} onChange={e=>setNewAsset(v=>({...v,purchase_date:e.target.value}))} />
          <button className="px-3 py-2 bg-orange-600 text-white rounded" onClick={async () => await addItem("hm_assets", newAsset)}>Add</button>
        </div>
        <div className="mt-3 overflow-auto"><table className="min-w-full text-sm"><thead className="bg-gray-50"><tr className="text-left text-gray-600"><th className="px-2 py-2">Hostel</th><th className="px-2 py-2">Item</th><th className="px-2 py-2">Qty</th><th className="px-2 py-2">Purchase</th><th className="px-2 py-2">Condition</th></tr></thead><tbody>
          {assets.length===0 && (<tr><td colSpan={5} className="text-center text-gray-400 py-6">No assets recorded.</td></tr>)}
          {assets.map(a => (<tr key={a.asset_id} className="border-t hover:bg-gray-50"><td className="px-2 py-2">{a.hostel_id}</td><td className="px-2 py-2">{a.item_type}</td><td className="px-2 py-2">{a.qty}</td><td className="px-2 py-2">{a.purchase_date}</td><td className="px-2 py-2">{a.condition}</td></tr>))}
        </tbody></table></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-3">Housekeeping Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <input className="input" placeholder="Hostel ID" value={newSchedule.hostel_id} onChange={e=>setNewSchedule(v=>({...v,hostel_id:e.target.value}))} />
          <input className="input" placeholder="Block ID" value={newSchedule.block_id} onChange={e=>setNewSchedule(v=>({...v,block_id:e.target.value}))} />
          <input className="input" type="number" placeholder="Floor" value={newSchedule.floor} onChange={e=>setNewSchedule(v=>({...v,floor:Number(e.target.value)}))} />
          <input className="input" placeholder="Janitor ID" value={newSchedule.janitor_id} onChange={e=>setNewSchedule(v=>({...v,janitor_id:e.target.value}))} />
          <input className="input" placeholder="Schedule" value={newSchedule.schedule} onChange={e=>setNewSchedule(v=>({...v,schedule:e.target.value}))} />
          <button className="px-3 py-2 bg-orange-600 text-white rounded" onClick={async () => await addItem("hm_housekeeping", newSchedule)}>Add</button>
        </div>
        <div className="mt-3 overflow-auto"><table className="min-w-full text-sm"><thead className="bg-gray-50"><tr className="text-left text-gray-600"><th className="px-2 py-2">Hostel</th><th className="px-2 py-2">Block</th><th className="px-2 py-2">Floor</th><th className="px-2 py-2">Janitor</th><th className="px-2 py-2">Schedule</th><th className="px-2 py-2">Status</th></tr></thead><tbody>
          {schedules.length===0 && (<tr><td colSpan={6} className="text-center text-gray-400 py-6">No schedules added.</td></tr>)}
          {schedules.map(s => (<tr key={s.id} className="border-t hover:bg-gray-50"><td className="px-2 py-2">{s.hostel_id}</td><td className="px-2 py-2">{s.block_id}</td><td className="px-2 py-2">{s.floor}</td><td className="px-2 py-2">{s.janitor_id}</td><td className="px-2 py-2">{s.schedule}</td><td className="px-2 py-2">{s.status}</td></tr>))}
        </tbody></table></div>
      </div>
    </div>
  );
};

export default MaintenanceHousekeeping;



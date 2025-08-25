import React, { useMemo, useState } from "react";
import { useCollection } from "../../utils/firestoreHooks";
import { createHostel, createBlock, createRoom, createBed, createFee } from "../../utils/hostelService";
import { Notice, Spinner, Field, TextInput, NumberInput, Select, TextArea } from "./SharedUI.jsx";

const Section = ({ title, children, actions, subtitle }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions}
    </div>
    {children}
  </div>
);

// Firestore collections used:
// hm_hostels, hm_blocks, hm_rooms, hm_beds, hm_fees

const SetupMaster = () => {
  const { data: hostels, loading: loadingHostels, error: errorHostels } = useCollection("hm_hostels", { orderByField: "name" });
  const { data: blocks } = useCollection("hm_blocks", { orderByField: "name" });
  const { data: rooms } = useCollection("hm_rooms", { orderByField: "room_no" });
  const { data: beds } = useCollection("hm_beds", { orderByField: "bed_no" });
  const { data: fees } = useCollection("hm_fees", { orderByField: "room_type" });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: '', message: '' });

  const [newHostel, setNewHostel] = useState({ name: "", address: "", type: "boys", capacity: 0, warden_id: "", contact_no: "" });
  const [newBlock, setNewBlock] = useState({ hostel_id: "", name: "", floors: 1, notes: "" });
  const [newRoom, setNewRoom] = useState({ block_id: "", room_no: "", room_type: "double", floor: 1, rent_per_sem: 0, deposit_amount: 0, status: "vacant" });
  const [newBed, setNewBed] = useState({ room_id: "", bed_no: "A", seat_code: "", status: "vacant" });
  const [newFee, setNewFee] = useState({ hostel_id: "", room_type: "double", cycle: "sem", amount: 0, refundable_deposit_flag: true });
  const [filters, setFilters] = useState({ hostel: '', block: '', roomType: '' });

  const blockOptions = useMemo(() => blocks.filter(b => hostels.some(h => h.id === b.hostel_id)), [blocks, hostels]);
  const roomOptions = useMemo(() => rooms.filter(r => blockOptions.some(b => b.id === r.block_id)), [rooms, blockOptions]);

  return (
    <div className="space-y-4">
      <Section title="Hostels" subtitle="Basic details and contacts" actions={
        <button disabled={saving} className={`px-3 py-1 rounded text-white ${saving? 'bg-orange-300' : 'bg-orange-600 hover:bg-orange-500'}`} onClick={async () => {
          try {
            setSaving(true);
            await createHostel(newHostel);
            setNewHostel({ name: "", address: "", type: "boys", capacity: 0, warden_id: "", contact_no: "" });
            setNotice({ type: 'success', message: 'Hostel added successfully' });
          } catch (e) {
            setNotice({ type: 'error', message: e.message || 'Failed to add hostel' });
          } finally { setSaving(false); }
        }}>{saving? <Spinner /> : 'Add'}</button>
      }>
        <Notice type={notice.type} message={notice.message} onClose={()=>setNotice({type:'',message:''})} />
        {loadingHostels && <div className="mt-2 text-sm text-gray-500 flex items-center gap-2"><Spinner /> Loading hostels…</div>}
        {errorHostels && <div className="mt-2 text-sm text-red-600">{String(errorHostels)}</div>}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <Field label="Name"><TextInput placeholder="Name" value={newHostel.name} onChange={e=>setNewHostel(v=>({...v,name:e.target.value}))} /></Field>
          <Field label="Address"><TextInput placeholder="Address" value={newHostel.address} onChange={e=>setNewHostel(v=>({...v,address:e.target.value}))} /></Field>
          <Field label="Type"><Select value={newHostel.type} onChange={e=>setNewHostel(v=>({...v,type:e.target.value}))}>
            <option value="boys">Boys</option>
            <option value="girls">Girls</option>
            <option value="mixed">Mixed</option>
          </Select></Field>
          <Field label="Capacity"><NumberInput placeholder="Capacity" value={newHostel.capacity} onChange={e=>setNewHostel(v=>({...v,capacity:Number(e.target.value)}))} /></Field>
          <Field label="Warden ID"><TextInput placeholder="Warden ID" value={newHostel.warden_id} onChange={e=>setNewHostel(v=>({...v,warden_id:e.target.value}))} /></Field>
          <Field label="Contact No"><TextInput placeholder="Contact No" value={newHostel.contact_no} onChange={e=>setNewHostel(v=>({...v,contact_no:e.target.value}))} /></Field>
        </div>
        <div className="mt-3 overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600">
                <th className="px-2 py-2">Name</th><th className="px-2 py-2">Type</th><th className="px-2 py-2">Capacity</th><th className="px-2 py-2">Warden</th><th className="px-2 py-2">Contact</th>
              </tr>
            </thead>
            <tbody>
              {hostels.length === 0 && (
                <tr><td colSpan={5} className="text-center text-gray-400 py-6">No hostels added yet.</td></tr>
              )}
              {hostels.map(h => (
                <tr key={h.id} className="border-t hover:bg-gray-50">
                  <td className="px-2 py-2 font-medium">{h.name}</td>
                  <td className="px-2 py-2"><span className="px-2 py-0.5 rounded-full text-xs bg-gray-100">{h.type}</span></td>
                  <td className="px-2 py-2">{h.capacity}</td>
                  <td className="px-2 py-2">{h.warden_id}</td>
                  <td className="px-2 py-2">{h.contact_no}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Blocks / Wings" subtitle="Organize buildings and floors" actions={
        <button className="px-3 py-1 bg-orange-600 text-white rounded" onClick={async () => {
          await createBlock(newBlock);
          setNewBlock({ hostel_id: "", name: "", floors: 1, notes: "" });
        }}>Add</button>
      }>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Field label="Hostel"><Select value={newBlock.hostel_id} onChange={e=>setNewBlock(v=>({...v,hostel_id:e.target.value}))}>
            <option value="">Select Hostel</option>
            {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </Select></Field>
          <Field label="Block Name"><TextInput placeholder="Block Name" value={newBlock.name} onChange={e=>setNewBlock(v=>({...v,name:e.target.value}))} /></Field>
          <Field label="Floors"><NumberInput placeholder="Floors" value={newBlock.floors} onChange={e=>setNewBlock(v=>({...v,floors:Number(e.target.value)}))} /></Field>
          <Field label="Notes"><TextInput placeholder="Notes" value={newBlock.notes} onChange={e=>setNewBlock(v=>({...v,notes:e.target.value}))} /></Field>
        </div>
        <div className="mt-3 overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50"><tr className="text-left text-gray-600"><th className="px-2 py-2">Hostel</th><th className="px-2 py-2">Name</th><th className="px-2 py-2">Floors</th><th className="px-2 py-2">Notes</th></tr></thead>
            <tbody>
              {blocks.length === 0 && (<tr><td colSpan={4} className="text-center text-gray-400 py-6">No blocks added yet.</td></tr>)}
              {blocks.map(b => (
                <tr key={b.id} className="border-t hover:bg-gray-50"><td className="px-2 py-2">{hostels.find(h=>h.id===b.hostel_id)?.name || '-'}</td><td className="px-2 py-2">{b.name}</td><td className="px-2 py-2">{b.floors}</td><td className="px-2 py-2">{b.notes}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Rooms" subtitle="Configure room types, rent and status" actions={
        <button className="px-3 py-1 bg-orange-600 text-white rounded" onClick={async () => {
          await createRoom(newRoom);
          setNewRoom({ block_id: "", room_no: "", room_type: "double", floor: 1, rent_per_sem: 0, deposit_amount: 0, status: "vacant" });
        }}>Add</button>
      }>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          <Field label="Block"><Select value={newRoom.block_id} onChange={e=>setNewRoom(v=>({...v,block_id:e.target.value}))}>
            <option value="">Select Block</option>
            {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </Select></Field>
          <Field label="Room No"><TextInput placeholder="Room No" value={newRoom.room_no} onChange={e=>setNewRoom(v=>({...v,room_no:e.target.value}))} /></Field>
          <Field label="Type"><Select value={newRoom.room_type} onChange={e=>setNewRoom(v=>({...v,room_type:e.target.value}))}>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="triple">Triple</option>
            <option value="quad">Quad</option>
          </Select></Field>
          <Field label="Floor"><NumberInput placeholder="Floor" value={newRoom.floor} onChange={e=>setNewRoom(v=>({...v,floor:Number(e.target.value)}))} /></Field>
          <Field label="Rent/Sem"><NumberInput placeholder="Rent/Sem" value={newRoom.rent_per_sem} onChange={e=>setNewRoom(v=>({...v,rent_per_sem:Number(e.target.value)}))} /></Field>
          <Field label="Deposit"><NumberInput placeholder="Deposit" value={newRoom.deposit_amount} onChange={e=>setNewRoom(v=>({...v,deposit_amount:Number(e.target.value)}))} /></Field>
          <Field label="Status"><Select value={newRoom.status} onChange={e=>setNewRoom(v=>({...v,status:e.target.value}))}>
            <option value="vacant">Vacant</option>
            <option value="occupied">Occupied</option>
            <option value="blocked">Blocked</option>
            <option value="maintenance">Maintenance</option>
          </Select></Field>
        </div>
        <div className="mt-3 overflow-auto">
          <div className="flex items-center gap-2 mb-2">
            <select className="input" value={filters.roomType} onChange={e=>setFilters(v=>({...v,roomType:e.target.value}))}>
              <option value="">All Types</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="triple">Triple</option>
              <option value="quad">Quad</option>
            </select>
            <input className="input" placeholder="Search room no" value={filters.roomSearch||''} onChange={e=>setFilters(v=>({...v,roomSearch:e.target.value}))} />
          </div>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50"><tr className="text-left text-gray-600"><th className="px-2 py-2">Block</th><th className="px-2 py-2">Room</th><th className="px-2 py-2">Type</th><th className="px-2 py-2">Floor</th><th className="px-2 py-2">Rent</th><th className="px-2 py-2">Deposit</th><th className="px-2 py-2">Status</th></tr></thead>
            <tbody>
              {rooms.length === 0 && (<tr><td colSpan={7} className="text-center text-gray-400 py-6">No rooms configured.</td></tr>)}
              {rooms.filter(r => (!filters.roomType || r.room_type===filters.roomType) && (!filters.roomSearch || (r.room_no||'').toLowerCase().includes(filters.roomSearch.toLowerCase()))).map(r => (
                <tr key={r.id} className="border-t hover:bg-gray-50"><td className="px-2 py-2">{blocks.find(b=>b.id===r.block_id)?.name || '-'}</td><td className="px-2 py-2">{r.room_no}</td><td className="px-2 py-2">{r.room_type}</td><td className="px-2 py-2">{r.floor}</td><td className="px-2 py-2">{r.rent_per_sem}</td><td className="px-2 py-2">{r.deposit_amount}</td><td className="px-2 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${r.status==='vacant'?'bg-green-100 text-green-700':r.status==='occupied'?'bg-blue-100 text-blue-700':r.status==='blocked'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-700'}`}>{r.status}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Beds / Seats" subtitle="Bed-level tracking" actions={
        <button className="px-3 py-1 bg-orange-600 text-white rounded" onClick={async () => {
          await createBed(newBed);
          setNewBed({ room_id: "", bed_no: "A", seat_code: "", status: "vacant" });
        }}>Add</button>
      }>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Field label="Room"><Select value={newBed.room_id} onChange={e=>setNewBed(v=>({...v,room_id:e.target.value}))}>
            <option value="">Select Room</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.room_no}</option>)}
          </Select></Field>
          <Field label="Bed No"><TextInput placeholder="Bed No" value={newBed.bed_no} onChange={e=>setNewBed(v=>({...v,bed_no:e.target.value}))} /></Field>
          <Field label="Seat Code"><TextInput placeholder="Seat Code" value={newBed.seat_code} onChange={e=>setNewBed(v=>({...v,seat_code:e.target.value}))} /></Field>
          <Field label="Status"><Select value={newBed.status} onChange={e=>setNewBed(v=>({...v,status:e.target.value}))}>
            <option value="vacant">Vacant</option>
            <option value="occupied">Occupied</option>
            <option value="blocked">Blocked</option>
            <option value="maintenance">Maintenance</option>
          </Select></Field>
        </div>
        <div className="mt-3 overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50"><tr className="text-left text-gray-600"><th className="px-2 py-2">Room</th><th className="px-2 py-2">Bed</th><th className="px-2 py-2">Seat Code</th><th className="px-2 py-2">Status</th></tr></thead>
            <tbody>
              {beds.length === 0 && (<tr><td colSpan={4} className="text-center text-gray-400 py-6">No beds added.</td></tr>)}
              {beds.map(b => (
                <tr key={b.id} className="border-t hover:bg-gray-50"><td className="px-2 py-2">{rooms.find(r=>r.id===b.room_id)?.room_no || '-'}</td><td className="px-2 py-2">{b.bed_no}</td><td className="px-2 py-2">{b.seat_code}</td><td className="px-2 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${b.status==='vacant'?'bg-green-100 text-green-700':b.status==='occupied'?'bg-blue-100 text-blue-700':b.status==='blocked'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-700'}`}>{b.status}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Hostel Fees" subtitle="Pricing per room type and cycle" actions={
        <button className="px-3 py-1 bg-orange-600 text-white rounded" onClick={async () => {
          await createFee(newFee);
          setNewFee({ hostel_id: "", room_type: "double", cycle: "sem", amount: 0, refundable_deposit_flag: true });
        }}>Add</button>
      }>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Field label="Hostel"><Select value={newFee.hostel_id} onChange={e=>setNewFee(v=>({...v,hostel_id:e.target.value}))}>
            <option value="">Select Hostel</option>
            {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </Select></Field>
          <Field label="Room Type"><Select value={newFee.room_type} onChange={e=>setNewFee(v=>({...v,room_type:e.target.value}))}>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="triple">Triple</option>
            <option value="quad">Quad</option>
          </Select></Field>
          <Field label="Cycle"><Select value={newFee.cycle} onChange={e=>setNewFee(v=>({...v,cycle:e.target.value}))}>
            <option value="sem">Semester</option>
            <option value="annual">Annual</option>
            <option value="monthly">Monthly</option>
          </Select></Field>
          <Field label="Amount"><NumberInput placeholder="Amount" value={newFee.amount} onChange={e=>setNewFee(v=>({...v,amount:Number(e.target.value)}))} /></Field>
          <Field label=" "><label className="inline-flex items-center gap-2 mt-6">
            <input type="checkbox" checked={newFee.refundable_deposit_flag} onChange={e=>setNewFee(v=>({...v,refundable_deposit_flag:e.target.checked}))} />
            <span>Refundable deposit</span>
          </label></Field>
        </div>
        <div className="mt-3 overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50"><tr className="text-left text-gray-600"><th className="px-2 py-2">Hostel</th><th className="px-2 py-2">Type</th><th className="px-2 py-2">Cycle</th><th className="px-2 py-2">Amount</th><th className="px-2 py-2">Refundable</th></tr></thead>
            <tbody>
              {fees.length === 0 && (<tr><td colSpan={5} className="text-center text-gray-400 py-6">No fees configured.</td></tr>)}
              {fees.map(f => (
                <tr key={f.id} className="border-t hover:bg-gray-50"><td className="px-2 py-2">{hostels.find(h=>h.id===f.hostel_id)?.name || '-'}</td><td className="px-2 py-2">{f.room_type}</td><td className="px-2 py-2">{f.cycle}</td><td className="px-2 py-2">{f.amount}</td><td className="px-2 py-2">{f.refundable_deposit_flag?"Yes":"No"}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
};

export default SetupMaster;



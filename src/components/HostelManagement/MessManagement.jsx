import React, { useState } from "react";
import { useCollection, addItem, setItem } from "../../utils/firestoreHooks";

const weekdays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const MessManagement = () => {
  const { data: menuDocs } = useCollection("hm_mess_menus");
  const menus = menuDocs.length ? menuDocs : weekdays.map(d => ({ id: d.toLowerCase(), day: d, breakfast: "", lunch: "", dinner: "" }));
  const { data: attendance } = useCollection("hm_mess_attendance", { orderByField: "date", orderDirection: "desc" });
  const [entry, setEntry] = useState({ student_id: "", date: new Date().toISOString().slice(0,10), meal: "breakfast" });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-3">Menu Planning</h3>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50"><tr className="text-left text-gray-600"><th className="px-2 py-2">Day</th><th className="px-2 py-2">Breakfast</th><th className="px-2 py-2">Lunch</th><th className="px-2 py-2">Dinner</th></tr></thead>
            <tbody>
              {menus.map((m, idx) => (
                <tr key={m.day} className="border-t hover:bg-gray-50">
                  <td className="px-2 py-2 font-medium">{m.day}</td>
                  <td className="px-2 py-2"><input className="input" value={m.breakfast} onChange={async e=>{ await setItem("hm_mess_menus", m.id || m.day.toLowerCase(), { day: m.day, breakfast: e.target.value }, true); }} /></td>
                  <td className="px-2 py-2"><input className="input" value={m.lunch} onChange={async e=>{ await setItem("hm_mess_menus", m.id || m.day.toLowerCase(), { day: m.day, lunch: e.target.value }, true); }} /></td>
                  <td className="px-2 py-2"><input className="input" value={m.dinner} onChange={async e=>{ await setItem("hm_mess_menus", m.id || m.day.toLowerCase(), { day: m.day, dinner: e.target.value }, true); }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-3">Mess Attendance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input className="input" placeholder="Student ID" value={entry.student_id} onChange={e=>setEntry(v=>({...v,student_id:e.target.value}))} />
          <input className="input" type="date" value={entry.date} onChange={e=>setEntry(v=>({...v,date:e.target.value}))} />
          <select className="input" value={entry.meal} onChange={e=>setEntry(v=>({...v,meal:e.target.value}))}>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
          </select>
          <button className="px-3 py-2 bg-orange-600 text-white rounded" onClick={async () => {
            await addItem("hm_mess_attendance", entry);
            setEntry({ student_id: "", date: new Date().toISOString().slice(0,10), meal: "breakfast" });
          }}>Mark</button>
        </div>
        <div className="mt-3 overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50"><tr className="text-left text-gray-600"><th className="px-2 py-2">Date</th><th className="px-2 py-2">Student</th><th className="px-2 py-2">Meal</th></tr></thead>
            <tbody>
              {attendance.length===0 && (<tr><td colSpan={3} className="text-center text-gray-400 py-6">No attendance marks yet.</td></tr>)}
              {attendance.slice(-50).reverse().map(a => (
                <tr key={a.id} className="border-t hover:bg-gray-50"><td className="px-2 py-2">{a.date}</td><td className="px-2 py-2">{a.student_id}</td><td className="px-2 py-2"><span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700 capitalize">{a.meal}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MessManagement;



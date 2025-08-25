import React, { useMemo, useState } from "react";
import { useCollection } from "../../utils/firestoreHooks";

const useLocal = (k, i) => i;

const Card = ({ title, value }) => (
  <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
    <div className="text-xs uppercase tracking-wide text-gray-500">{title}</div>
    <div className="text-3xl font-extrabold mt-1">{value}</div>
  </div>
);

const HostelReports = () => {
  const { data: hostels } = useCollection("hm_hostels");
  const { data: rooms } = useCollection("hm_rooms");
  const { data: beds } = useCollection("hm_beds");
  const { data: allots } = useCollection("hm_allotments");
  const { data: mess } = useCollection("hm_mess_attendance");
  const { data: tickets } = useCollection("hm_maint_tickets");

  const occupancyRate = useMemo(() => {
    const totalBeds = beds.length;
    const occupied = beds.filter(b => b.status === 'occupied').length;
    return totalBeds ? Math.round((occupied/totalBeds)*100) + '%' : '0%';
  }, [beds]);

  const activeTickets = tickets.filter(t => t.status !== 'closed').length;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Key Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Hostels" value={hostels.length} />
        <Card title="Occupancy" value={occupancyRate} />
        <Card title="Active Tickets" value={activeTickets} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h4 className="font-semibold mb-2">Recent Allotments</h4>
        <div className="overflow-auto"><table className="min-w-full text-sm"><thead><tr className="text-left"><th>Date</th><th>Student</th><th>Room</th><th>Status</th></tr></thead><tbody>
          {allots.slice(-20).reverse().map(a => (<tr key={a.allotment_id} className="border-t"><td>{a.allot_date}</td><td>{a.student_id}</td><td>{a.room_id}</td><td>{a.status}</td></tr>))}
        </tbody></table></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h4 className="font-semibold mb-2">Mess Consumption (last 30 marks)</h4>
        <div className="overflow-auto"><table className="min-w-full text-sm"><thead><tr className="text-left"><th>Date</th><th>Student</th><th>Meal</th></tr></thead><tbody>
          {mess.slice(-30).reverse().map(m => (<tr key={m.id} className="border-t"><td>{m.date}</td><td>{m.student_id}</td><td>{m.meal}</td></tr>))}
        </tbody></table></div>
      </div>
    </div>
  );
};

export default HostelReports;



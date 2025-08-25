import React, { useState } from "react";
import { useSingletonDoc, setItem } from "../../utils/firestoreHooks";

const HostelPolicy = () => {
  const { data } = useSingletonDoc("hm_meta", "policy");
  const [policy, setPolicy] = useState(data || { checkin_rules: "", checkout_rules: "", leave_workflow: "", anti_ragging: false, fire_safety_checked: false });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-3">Policy & Compliance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <textarea className="input" rows={4} placeholder="Check-in Rules" value={policy.checkin_rules} onChange={async e=>{ const val = e.target.value; setPolicy(v=>({...v,checkin_rules:val})); await setItem("hm_meta", "policy", { checkin_rules: val }, true); }} />
          <textarea className="input" rows={4} placeholder="Check-out Rules" value={policy.checkout_rules} onChange={async e=>{ const val = e.target.value; setPolicy(v=>({...v,checkout_rules:val})); await setItem("hm_meta", "policy", { checkout_rules: val }, true); }} />
          <textarea className="input" rows={4} placeholder="Leave & Permission Workflow" value={policy.leave_workflow} onChange={async e=>{ const val = e.target.value; setPolicy(v=>({...v,leave_workflow:val})); await setItem("hm_meta", "policy", { leave_workflow: val }, true); }} />
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={policy.anti_ragging} onChange={async e=>{ const val = e.target.checked; setPolicy(v=>({...v,anti_ragging:val})); await setItem("hm_meta", "policy", { anti_ragging: val }, true); }} />
            <span>Anti-ragging affidavit collected</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={policy.fire_safety_checked} onChange={async e=>{ const val = e.target.checked; setPolicy(v=>({...v,fire_safety_checked:val})); await setItem("hm_meta", "policy", { fire_safety_checked: val }, true); }} />
            <span>Fire safety checks completed</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default HostelPolicy;



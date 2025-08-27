import React from "react";

const FeedbackSettings = () => {
  return (
    <div className="space-y-3">
      <div className="p-3 border rounded">
        <div className="font-medium">Privacy & Anonymity</div>
        <div className="text-sm text-gray-500">Configure anonymous mode, consent, and PII handling.</div>
      </div>
      <div className="p-3 border rounded">
        <div className="font-medium">Moderation</div>
        <div className="text-sm text-gray-500">Auto-flagging rules and reviewer workflow.</div>
      </div>
    </div>
  );
};

export default FeedbackSettings;



import React from "react";

const FeedbackDistribute = () => {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-3">
        <div className="p-3 border rounded">
          <div className="font-medium">Channels</div>
          <div className="text-sm text-gray-500">Email, SMS, In-app, WhatsApp, QR</div>
        </div>
        <div className="p-3 border rounded">
          <div className="font-medium">Audience</div>
          <div className="text-sm text-gray-500">Use filters to select target cohorts</div>
        </div>
        <div className="p-3 border rounded">
          <div className="font-medium">Scheduling</div>
          <div className="text-sm text-gray-500">Choose start/end and reminder rules</div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDistribute;



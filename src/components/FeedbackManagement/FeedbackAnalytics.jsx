import React from "react";

const Card = ({ title, children }) => (
  <div className="p-4 border rounded bg-white">
    <div className="text-sm text-gray-500 mb-1">{title}</div>
    {children}
  </div>
);

const FeedbackAnalytics = () => {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <Card title="Response Rate">—</Card>
      <Card title="Average Rating">—</Card>
      <Card title="NPS">—</Card>
      <Card title="Trends">—</Card>
    </div>
  );
};

export default FeedbackAnalytics;



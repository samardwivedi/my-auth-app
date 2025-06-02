import React from "react";
import RequestTrendsChart from "../components/charts/RequestTrendsChart";
import ConversionFunnel from "../components/charts/ConversionFunnel";
import GeoHeatmap from "../components/maps/GeoHeatmap";

// Analytics Tab Content
const AdminDashboardAnalytics = ({ users, requests }) => {
  return (
    <div>
      <h2 className="text-xl mb-6">Analytics & Insights Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="col-span-1 md:col-span-2 bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Request Trends</h3>
          <RequestTrendsChart initialData={requests} />
        </div>
        <div className="col-span-1 bg-white p-4 rounded shadow">
          <ConversionFunnel data={{
            visitors: 12500,
            signups: users?.length || 0,
            requests: requests?.length || 0,
            completed: requests?.filter(r => r.status === 'completed').length || 0
          }} />
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow mb-8">
        <h3 className="text-lg font-semibold mb-4">Geographical Distribution</h3>
        <GeoHeatmap dataType="requests" />
      </div>
    </div>
  );
};

export default AdminDashboardAnalytics;

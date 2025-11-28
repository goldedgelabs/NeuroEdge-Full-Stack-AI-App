'use client';

import React from 'react';

export default function Page() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-3">Admin Panel</h1>

      <p className="text-gray-600 mb-6">
        Welcome to the Admin area. Use the dashboard to monitor activity, manage agents,
        view logs, and configure system settings.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="p-4 border rounded-xl shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-1">System Overview</h2>
          <p className="text-gray-600">Server health, uptime, and performance.</p>
        </div>

        <div className="p-4 border rounded-xl shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-1">Agents</h2>
          <p className="text-gray-600">Manage all AI agents and behaviors.</p>
        </div>

        <div className="p-4 border rounded-xl shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-1">Logs</h2>
          <p className="text-gray-600">View system logs and error reports.</p>
        </div>

        <div className="p-4 border rounded-xl shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-1">Settings</h2>
          <p className="text-gray-600">Configure backend connections and security.</p>
        </div>

      </div>
    </div>
  );
}

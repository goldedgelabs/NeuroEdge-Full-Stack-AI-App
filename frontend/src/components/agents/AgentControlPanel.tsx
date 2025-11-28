'use client';

import React, { useState } from 'react';
import { Play, Square, RefreshCcw, Cog, SendHorizontal } from 'lucide-react';
import axios from 'axios';

interface Props {
  agentId: string;
}

export default function AgentControlPanel({ agentId }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<string | null>(null);

  const callAPI = async (action: string, payload: any = {}) => {
    setLoading(action);
    setResult(null);

    try {
      // 🔒 Replace with your real backend API route:
      await axios.post(`/api/agents/${agentId}/${action}`, payload);

      setResult(`Action "${action}" executed successfully.`);
    } catch (err: any) {
      setResult(`❌ Error: ${err?.response?.data?.error || "Unknown error"}`);
    } finally {
      setLoading(null);
      setOpenModal(null);
    }
  };

  const ActionButton = ({
    action,
    label,
    icon: Icon,
    color,
  }: {
    action: string;
    label: string;
    icon: any;
    color: string;
  }) => (
    <button
      onClick={() => setOpenModal(action)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm transition hover:shadow-md bg-white ${color}`}
      disabled={!!loading}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-lg space-y-6">
      <h3 className="text-xl font-semibold">Agent Controls</h3>

      {/* Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        <ActionButton
          action="start"
          label="Start Agent"
          icon={Play}
          color="text-green-700 border-green-300"
        />

        <ActionButton
          action="stop"
          label="Stop Agent"
          icon={Square}
          color="text-red-600 border-red-300"
        />

        <ActionButton
          action="restart"
          label="Restart Agent"
          icon={RefreshCcw}
          color="text-blue-700 border-blue-300"
        />

        <ActionButton
          action="reload-config"
          label="Reload Config"
          icon={Cog}
          color="text-gray-700 border-gray-300"
        />
      </div>

      {/* Test Message */}
      <div className="bg-gray-50 p-4 rounded-xl border">
        <p className="font-medium mb-2">Send Test Message</p>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded-xl p-2 bg-white"
            placeholder="Message to agent..."
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded-xl flex items-center gap-2 hover:bg-purple-700 transition"
            onClick={() => callAPI("test", { message: testMessage })}
            disabled={!testMessage.trim() || !!loading}
          >
            <SendHorizontal size={18} />
            Send
          </button>
        </div>
      </div>

      {/* Result Output */}
      {result && (
        <div className="p-3 rounded-xl bg-gray-100 border text-gray-800">
          {result}
        </div>
      )}

      {/* Confirmation Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md border">
            <h3 className="text-lg font-semibold mb-2">Confirm Action</h3>

            <p className="text-gray-700 mb-6">
              Are you sure you want to <b>{openModal}</b> this agent?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenModal(null)}
                className="px-4 py-2 border rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={() => callAPI(openModal)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                disabled={!!loading}
              >
                {loading === openModal ? "Working…" : "Yes, Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

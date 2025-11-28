'use client';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import * as idb from '@/lib/idb';
import { sendMessage } from '@/lib/chatApi';

export default function MessageItem({ msg, onUpdate }: { msg: idb.Message; onUpdate?: ()=>void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(msg.text);

  async function saveEdit() {
    msg.text = val;
    await idb.saveMessage(msg);
    setEditing(false);
    onUpdate && onUpdate();
  }

  async function regenerate() {
    // send the edited/selected message back to the engine as a prompt
    await sendMessage(msg.conversationId, msg.text);
  }

  return (
    <div className={`p-3 rounded ${msg.role==='user' ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-100'}`}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          {!editing ? (
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          ) : (
            <textarea value={val} onChange={(e)=>setVal(e.target.value)} className="w-full p-2 bg-gray-800" rows={4} />
          )}
        </div>

        <div className="flex flex-col gap-2 ml-3">
          {editing ? (
            <>
              <button className="btn-ghost" onClick={saveEdit}>Save</button>
              <button className="btn-ghost" onClick={()=>setEditing(false)}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={()=>setEditing(true)}>Edit</button>
              <button className="btn-ghost" onClick={regenerate}>Regenerate</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

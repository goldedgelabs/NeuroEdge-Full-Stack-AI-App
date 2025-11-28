'use client';
import React, { useEffect, useState } from 'react';
import * as idb from '@/lib/idb';
import { v4 as uuidv4 } from 'uuid';

export default function ConversationFolders({ onSelect }: { onSelect: (conversationId?: string) => void }) {
  const [folders, setFolders] = useState<idb.Folder[]>([]);
  const [convs, setConvs] = useState<idb.Conversation[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    (async () => {
      setFolders(await idb.listFolders());
      setConvs(await idb.listConversations());
    })();
  }, []);

  async function createFolder() {
    const f: idb.Folder = { id: uuidv4(), name: name || 'Untitled', createdAt: Date.now() };
    await idb.saveFolder(f);
    setFolders(await idb.listFolders());
    setName('');
  }

  async function newConversation(folderId?: string) {
    const conv: idb.Conversation = {
      id: uuidv4(),
      title: 'New conversation',
      folderId: folderId || null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: false
    };
    await idb.saveConversation(conv);
    setConvs(await idb.listConversations());
    onSelect(conv.id);
  }

  return (
    <div className="p-3 space-y-4">
      <div>
        <h4 className="font-semibold">Folders</h4>
        <div className="mt-2 flex gap-2">
          <input className="flex-1 p-2 rounded border bg-gray-800" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Folder name"/>
          <button className="btn" onClick={createFolder}>Create</button>
        </div>
      </div>

      <div>
        <button className="btn-ghost w-full text-left" onClick={()=>newConversation(undefined)}>+ New conversation (All)</button>

        <div className="mt-3 space-y-2">
          {folders.map(f => (
            <div key={f.id} className="p-2 rounded hover:bg-gray-800 cursor-pointer flex justify-between items-center">
              <div onClick={() => onSelect(undefined)}>{f.name}</div>
              <div className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold mt-4">Conversations</h4>
        <div className="mt-2 space-y-2 max-h-64 overflow-auto">
          {convs.map(c => (
            <div key={c.id} className="p-2 rounded hover:bg-gray-800 cursor-pointer" onClick={() => onSelect(c.id)}>
              <div className="font-medium">{c.title}</div>
              <div className="text-xs text-gray-400">{new Date(c.updatedAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
                                            }

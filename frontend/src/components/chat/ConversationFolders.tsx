// src/components/chat/ConversationFolders.tsx
'use client';
import React, { useEffect, useState } from 'react';
import * as idb from '@/lib/idb';
import { v4 as uuidv4 } from 'uuid';

export default function ConversationFolders({ onSelect }: { onSelect: (id?:string)=>void }) {
  const [folders, setFolders] = useState<idb.Folder[]>([]);
  const [name, setName] = useState('');
  useEffect(()=> { idb.listFolders().then(setFolders); }, []);

  const create = async ()=> {
    const f: idb.Folder = { id: uuidv4(), name: name || 'Untitled', createdAt: Date.now() };
    await idb.saveFolder(f);
    setFolders(await idb.listFolders());
    setName('');
  };

  return (
    <div>
      <div className="mb-3">
        <input className="p-2 border rounded w-full" value={name} onChange={e=>setName(e.target.value)} placeholder="New folder name"/>
        <button className="mt-2 px-3 py-2 bg-blue-600 text-white rounded" onClick={create}>Create Folder</button>
      </div>

      <div className="space-y-2">
        <div className="p-2 rounded cursor-pointer hover:bg-gray-100" onClick={()=>onSelect(undefined)}>All conversations</div>
        {folders.map(f => (
          <div key={f.id} className="p-2 rounded cursor-pointer hover:bg-gray-100" onClick={()=>onSelect(f.id)}>{f.name}</div>
        ))}
      </div>
    </div>
  );
}

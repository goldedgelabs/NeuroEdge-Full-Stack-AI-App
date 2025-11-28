// src/lib/idb.ts
import { openDB, IDBPDatabase } from 'idb';

export type Message = {
  id: string;
  conversationId: string;
  role: 'user'|'assistant'|'system';
  text: string;
  createdAt: number;
  streaming?: boolean;
  reactions?: Record<string, number>; // e.g. { like: 1, dislike: 0 }
  read?: boolean;
  meta?: any;
};

export type Conversation = {
  id: string;
  title: string;
  folderId?: string | null;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  meta?: any;
};

export type Folder = {
  id: string;
  name: string;
  createdAt: number;
};

let dbPromise: Promise<IDBPDatabase> | null = null;

export function db() {
  if (!dbPromise) {
    dbPromise = openDB('neuroedge-db', 1, {
      upgrade(db) {
        db.createObjectStore('conversations', { keyPath: 'id' });
        db.createObjectStore('messages', { keyPath: 'id' });
        db.createObjectStore('folders', { keyPath: 'id' });
        db.createObjectStore('meta', { keyPath: 'key' });
      }
    });
  }
  return dbPromise;
}

// Conversations
export async function saveConversation(conv: Conversation) {
  const d = await db();
  conv.updatedAt = Date.now();
  await d.put('conversations', conv);
}
export async function getConversation(id: string) {
  const d = await db();
  return d.get('conversations', id) as Promise<Conversation | undefined>;
}
export async function listConversations() {
  const d = await db();
  return d.getAll('conversations') as Promise<Conversation[]>;
}
export async function deleteConversation(id: string) {
  const d = await db();
  await d.delete('conversations', id);
  // Optionally delete messages
  const all = await d.getAll('messages');
  await Promise.all(all.filter(m=>m.conversationId===id).map(m=>d.delete('messages', m.id)));
}

// Messages
export async function saveMessage(msg: Message) {
  const d = await db();
  await d.put('messages', msg);
}
export async function listMessages(conversationId: string) {
  const d = await db();
  const all = await d.getAll('messages') as Message[];
  return all.filter(m=>m.conversationId===conversationId).sort((a,b)=>a.createdAt-b.createdAt);
}

// Folders
export async function listFolders() {
  const d = await db();
  return d.getAll('folders') as Promise<Folder[]>;
}
export async function saveFolder(f: Folder) {
  const d = await db();
  await d.put('folders', f);
}
export async function deleteFolder(id: string) {
  const d = await db();
  await d.delete('folders', id);
}

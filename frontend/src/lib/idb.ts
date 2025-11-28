// src/lib/idb.ts
import { openDB, IDBPDatabase } from 'idb';

export type Message = {
  id: string;
  conversationId: string;
  role: 'user'|'assistant'|'system';
  text: string;
  createdAt: number;
  streaming?: boolean;
  reactions?: Record<string, number>;
  read?: boolean;
  meta?: any;
};

export type Conversation = {
  id: string;
  title: string;
  folderId?: string|null;
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
function getDB() {
  if (!dbPromise) {
    dbPromise = openDB('neuroedge-db', 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('conversations')) db.createObjectStore('conversations', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('messages')) db.createObjectStore('messages', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('folders')) db.createObjectStore('folders', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' });
      }
    });
  }
  return dbPromise;
}

// Conversations
export async function saveConversation(conv: Conversation) {
  const d = await getDB();
  conv.updatedAt = Date.now();
  await d.put('conversations', conv);
}

export async function getConversation(id: string) {
  const d = await getDB();
  return d.get('conversations', id) as Promise<Conversation | undefined>;
}

export async function listConversations() {
  const d = await getDB();
  return d.getAll('conversations') as Promise<Conversation[]>;
}

export async function deleteConversation(id: string) {
  const d = await getDB();
  await d.delete('conversations', id);
  const all = await d.getAll('messages') as Message[];
  await Promise.all(all.filter(m => m.conversationId === id).map(m => d.delete('messages', m.id)));
}

// Messages
export async function saveMessage(msg: Message) {
  const d = await getDB();
  await d.put('messages', msg);
}

export async function getMessage(id: string) {
  const d = await getDB();
  return d.get('messages', id) as Promise<Message | undefined>;
}

export async function listMessages(conversationId: string) {
  const d = await getDB();
  const all = await d.getAll('messages') as Message[];
  return all.filter(m => m.conversationId === conversationId).sort((a,b)=>a.createdAt - b.createdAt);
}

export async function deleteMessage(id: string) {
  const d = await getDB();
  await d.delete('messages', id);
}

// Folders
export async function listFolders() {
  const d = await getDB();
  return d.getAll('folders') as Promise<Folder[]>;
}
export async function saveFolder(f: Folder) {
  const d = await getDB();
  await d.put('folders', f);
}
export async function deleteFolder(id: string) {
  const d = await getDB();
  await d.delete('folders', id);
}

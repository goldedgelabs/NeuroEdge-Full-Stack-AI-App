// src/lib/offline-db.ts
import Dexie from 'dexie';
import type { ChatMessage } from '@/types/chat'; // optional: create a types file or inline
import { decryptJSON } from '@/lib/secure-storage';

export interface EncryptedRow {
  id?: number;
  cipher: string;
  createdAt: number;
}

export interface QueueRow {
  id?: number;
  payload: any;
  createdAt: number;
}

/**
 * NeuroDB keeps messages encrypted at rest by default.
 * Migration strategy:
 *  - v1: plain messages (legacy)
 *  - v2: encrypted messages (cipher + createdAt)
 */
class NeuroDB extends Dexie {
  messages!: Dexie.Table<EncryptedRow | ChatMessage, number>;
  queue!: Dexie.Table<QueueRow, number>;

  constructor() {
    super('neuroedge_db');
    // If upgrading from earlier schema, bump version and add migration logic here.
    this.version(1).stores({
      messages: '++id,createdAt',
      queue: '++id,createdAt'
    });
    this.on('ready', () => {
      // no-op now
    });
  }
}

export const db = new NeuroDB();

/**
 * Add a raw encrypted row (ciphertext)
 */
export async function addEncryptedRow(cipher: string) {
  return db.table('messages').add({ cipher, createdAt: Date.now() } as EncryptedRow);
}

/**
 * Add legacy plain message (for backward compatibility)
 */
export async function addPlainMessage(msg: ChatMessage) {
  // store as plain (legacy) - consumer should migrate to encrypted adapter
  return db.table('messages').add({ ...msg } as any);
}

/**
 * Read and decrypt all messages (returns array of ChatMessage-like objects)
 */
export async function getAllDecryptedMessages(): Promise<Array<ChatMessage | any>> {
  const rows = await db.table('messages').toArray();
  const out: any[] = [];
  for (const r of rows) {
    // if row has cipher -> decrypt, else assume it is legacy plain object
    if ((r as any).cipher) {
      try {
        const obj = await decryptJSON((r as any).cipher);
        out.push({ ...obj, _id: (r as any).id, createdAt: (r as any).createdAt });
      } catch (e) {
        // decryption failed — include raw object to avoid data loss
        out.push({ _raw: r });
      }
    } else {
      out.push({ ...(r as any), _id: (r as any).id });
    }
  }
  // sort by createdAt ascending
  out.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  return out;
}

/**
 * Queue helpers (used by SW for flush)
 */
export async function addToQueue(payload: any) {
  return db.table('queue').add({ payload, createdAt: Date.now() } as QueueRow);
}
export async function getQueueItems() {
  return db.table('queue').toArray();
}
export async function removeQueueItem(id: number) {
  return db.table('queue').delete(id);
                  }

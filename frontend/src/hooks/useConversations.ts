import { useEffect, useState } from 'react';
import * as idb from '@/lib/idb';

export function useConversations(conversationId?: string) {
  const [messages, setMessages] = useState<idb.Message[]>([]);
  const [conversations, setConversations] = useState<idb.Conversation[]>([]);

  useEffect(() => {
    (async () => {
      setConversations(await idb.listConversations());
      if (conversationId) setMessages(await idb.listMessages(conversationId));
    })();
  }, [conversationId]);

  async function appendMessage(msg: idb.Message) {
    await idb.saveMessage(msg);
    setMessages(await idb.listMessages(msg.conversationId));
  }

  async function updateMessage(msg: idb.Message) {
    await idb.saveMessage(msg);
    setMessages(await idb.listMessages(msg.conversationId));
  }

  return { messages, conversations, appendMessage, updateMessage };
}

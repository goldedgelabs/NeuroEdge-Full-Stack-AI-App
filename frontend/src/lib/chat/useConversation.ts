// src/lib/chat/useConversation.ts
import { useEffect, useMemo, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as idb from '@/lib/idb';
import { WSClient } from '@/lib/ws';

export function useConversation(conversationId: string) {
  const [messages, setMessages] = useState<idb.Message[]>([]);
  const [loading, setLoading] = useState(false);
  const wsRef = useRef<WSClient | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const msgs = await idb.listMessages(conversationId);
      if (mounted) setMessages(msgs);
    })();
    return () => { mounted = false; wsRef.current?.close(); };
  }, [conversationId]);

  async function sendUser(text: string) {
    const msg: idb.Message = {
      id: uuidv4(),
      conversationId,
      role: 'user',
      text,
      createdAt: Date.now(),
      read: true
    };
    setMessages((m)=>[...m, msg]);
    await idb.saveMessage(msg);
    // open or reuse WS streaming connection
    startStreaming((chunk)=> {
      // apply streaming chunk to assistant message
      // see startStreaming implementation below
    });
    // send to backend via fetch (or via serverless)
    return msg;
  }

  function startStreaming(onChunk?: (chunk:string)=>void) {
    if (wsRef.current) return wsRef.current;
    const base = process.env.NEXT_PUBLIC_WS_URL || `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`;
    const url = `${base.replace(/\/$/,'')}/ws/chat/${conversationId}`;
    const client = new WSClient(url);
    wsRef.current = client;
    client.subscribe((m) => {
      if (m?.type === 'chunk') {
        onChunk?.(m.chunk);
      } else if (m?.type === 'message') {
        const assistant: idb.Message = {
          id: uuidv4(),
          conversationId,
          role: 'assistant',
          text: m.text,
          createdAt: Date.now(),
          streaming: false,
        };
        setMessages((s)=>[...s, assistant]);
        idb.saveMessage(assistant);
      } else if (m?.type === 'typing') {
        // handle typing indicator if needed
      }
    });
    return client;
  }

  async function addAssistantChunk(concatText: string) {
    // append or create assistant message being streamed
    const existing = messages.find(m=>m.role==='assistant' && m.streaming);
    if (existing) {
      existing.text += concatText;
      await idb.saveMessage(existing);
      setMessages((m)=>m.map(mm=>mm.id===existing.id?existing:mm));
    } else {
      const msg: idb.Message = {
        id: uuidv4(),
        conversationId,
        role: 'assistant',
        text: concatText,
        createdAt: Date.now(),
        streaming: true
      };
      await idb.saveMessage(msg);
      setMessages((m)=>[...m, msg]);
    }
  }

  async function setReaction(messageId:string, reaction:string) {
    const msg = messages.find(m=>m.id===messageId);
    if (!msg) return;
    msg.reactions = msg.reactions || {};
    msg.reactions[reaction] = (msg.reactions[reaction] || 0) + 1;
    await idb.saveMessage(msg);
    setMessages((m)=>m.map(mm=>mm.id===msg.id?msg:mm));
  }

  async function markRead(messageId:string) {
    const msg = messages.find(m=>m.id===messageId);
    if (!msg) return;
    msg.read = true;
    await idb.saveMessage(msg);
    setMessages((m)=>m.map(mm=>mm.id===msg.id?msg:mm));
  }

  return {
    messages,
    loading,
    sendUser,
    startStreaming,
    addAssistantChunk,
    setReaction,
    markRead,
    setMessages
  };
}
